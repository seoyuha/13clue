import mqtt from 'mqtt';

/**
 * 실시간 멀티플레이 통신 엔진 (Realtime Sync Engine)
 * 1. 글로벌 고성능 MQTT WebSocket (기본: broker.emqx.io:8084 / 보조: broker.hivemq.com:8884)
 * 2. 학교 내부망 전용 교실 로컬 WebSocket 서버 (localStorage: 'clues13_relay_server' 지정 시 우선 사용)
 * 3. 동일 기기 다중 탭 테스트용 BroadcastChannel 동시 연동 (0ms)
 */

export const CLIENT_ID = 'client_' + Math.random().toString(36).slice(2, 10);

export type RealtimeEvent =
  | { type: 'JOIN'; seat: number; name: string }
  | { type: 'LEAVE'; seat: number }
  | { type: 'START_GAME'; names?: Record<number, string> }
  | { type: 'CLAIM_SEAT'; seat: number; name: string; clientId: string }
  | { type: 'RELEASE_SEAT'; seat: number; clientId: string }
  | { type: 'SYNC_LOBBY'; seats: Record<number, { name: string; clientId: string }> }
  | { type: 'REQ_LOBBY_SYNC'; clientId: string }
  | { type: 'NEXT_TURN'; turnSeat: number; turnNumber: number }
  | { type: 'TOKEN_CHANGE'; seat: number; tokens: number }
  | { type: 'SECRET_VIEW'; seat: number; letter: string }
  | { type: 'ACCUSE_RESULT'; seat: number; name: string; isCorrect: boolean }
  | { type: 'NAME_UPDATE'; seat: number; name: string }
  | { type: 'PING'; seat: number; name: string };

type WrappedEvent = RealtimeEvent & { _sender: string; _ts: number };

const BROKERS = [
  'wss://broker.emqx.io:8084/mqtt',
  'wss://broker.hivemq.com:8884/mqtt',
];

export class RealtimeChannel {
  private roomId: string;
  private clientId: string;
  private mqttClient: any = null;
  private customWs: WebSocket | null = null;
  private bc: BroadcastChannel | null = null;
  private listeners: ((event: RealtimeEvent) => void)[] = [];
  private statusListeners: ((online: boolean, provider: string) => void)[] = [];
  private isConnected = false;
  private currentBrokerIdx = 0;
  private isDestroyed = false;
  private queue: WrappedEvent[] = [];
  private activeProvider = '연결 중...';

  constructor(roomId: string, clientId: string = CLIENT_ID) {
    this.roomId = roomId;
    this.clientId = clientId;

    this.initBroadcastChannel();
    this.initNetwork();
  }

  private initBroadcastChannel() {
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        this.bc = new BroadcastChannel(`13clues_v2_room_${this.roomId}`);
        this.bc.onmessage = (e) => {
          if (e.data && e.data.type && e.data._sender !== this.clientId) {
            this.notifyListeners(e.data);
          }
        };
      } catch (err) {
        console.warn('BroadcastChannel error:', err);
      }
    }
  }

  private initNetwork() {
    // 1. 교실 로컬 서버 (설정된 경우)
    const customRelay = typeof localStorage !== 'undefined' ? localStorage.getItem('clues13_relay_server') : null;
    if (customRelay && customRelay.trim()) {
      this.initCustomWebSocket(customRelay.trim());
      return;
    }

    // 2. 고성능 공용 MQTT 클라우드 브로커 (기본 동작)
    this.initMqtt(this.currentBrokerIdx);
  }

  private initCustomWebSocket(serverUrl: string) {
    try {
      this.customWs = new WebSocket(serverUrl);
      this.activeProvider = '교실 로컬 서버';

      this.customWs.onopen = () => {
        if (this.isDestroyed) return;
        this.isConnected = true;
        this.notifyStatus(true, this.activeProvider);
        // 방 등록
        this.customWs?.send(JSON.stringify({ action: 'join', roomId: this.roomId }));
        this.flushQueue();
      };

      this.customWs.onmessage = (e) => {
        try {
          const parsed = JSON.parse(e.data);
          if (parsed && parsed.type && parsed._sender !== this.clientId) {
            this.notifyListeners(parsed);
          }
        } catch {}
      };

      this.customWs.onclose = () => {
        this.isConnected = false;
        this.notifyStatus(false, '교실 서버 재연결 중...');
        if (!this.isDestroyed) {
          setTimeout(() => this.initCustomWebSocket(serverUrl), 3000);
        }
      };

      this.customWs.onerror = () => {
        this.isConnected = false;
      };
    } catch (e) {
      console.warn('Custom WS init error:', e);
    }
  }

  private initMqtt(brokerIdx: number) {
    if (this.isDestroyed) return;

    const brokerUrl = BROKERS[brokerIdx % BROKERS.length];
    const isPrimary = brokerIdx % BROKERS.length === 0;
    this.activeProvider = isPrimary ? '공개 클라우드 (EMQX)' : '공개 클라우드 (HiveMQ)';

    try {
      const client = mqtt.connect(brokerUrl, {
        clientId: `13clues_${this.clientId}_${Math.random().toString(16).slice(2, 6)}`,
        clean: true,
        connectTimeout: 5000,
        reconnectPeriod: 4000,
      });

      this.mqttClient = client;
      const topic = `13clues_v2/room_${this.roomId}`;

      client.on('connect', () => {
        if (this.isDestroyed) {
          client.end();
          return;
        }
        this.isConnected = true;
        this.notifyStatus(true, this.activeProvider);

        client.subscribe(topic, { qos: 1 }, (err: any) => {
          if (!err) {
            this.flushQueue();
          }
        });
      });

      client.on('message', (_t: string, payload: any) => {
        try {
          const raw = payload.toString();
          const parsed: WrappedEvent = JSON.parse(raw);
          if (parsed && parsed.type && parsed._sender !== this.clientId) {
            this.notifyListeners(parsed);
          }
        } catch (e) {
          console.warn('MQTT message parse error:', e);
        }
      });

      client.on('error', (err: any) => {
        console.warn('MQTT broker error:', brokerUrl, err);
        // 다음 보조 브로커로 페일오버
        if (!this.isConnected && brokerIdx === 0 && !this.isDestroyed) {
          client.end(true);
          this.currentBrokerIdx = 1;
          setTimeout(() => this.initMqtt(1), 1000);
        }
      });

      client.on('close', () => {
        this.isConnected = false;
        this.notifyStatus(false, '재연결 시도 중...');
      });
    } catch (e) {
      console.warn('MQTT connect error:', e);
    }
  }

  private flushQueue() {
    if (this.queue.length === 0) return;
    const toSend = [...this.queue];
    this.queue = [];
    toSend.forEach((item) => this.sendToNetwork(item));
  }

  private sendToNetwork(wrapped: WrappedEvent) {
    const raw = JSON.stringify(wrapped);

    // 1. 커스텀 WS
    if (this.customWs && this.customWs.readyState === WebSocket.OPEN) {
      try {
        this.customWs.send(JSON.stringify({ action: 'broadcast', roomId: this.roomId, data: wrapped }));
      } catch {}
    }

    // 2. MQTT
    if (this.mqttClient && this.isConnected) {
      const topic = `13clues_v2/room_${this.roomId}`;
      try {
        this.mqttClient.publish(topic, raw, { qos: 1 });
      } catch (err) {
        console.warn('MQTT publish error:', err);
      }
    }
  }

  public isOnline(): boolean {
    return this.isConnected;
  }

  public getProviderName(): string {
    return this.activeProvider;
  }

  public onStatus(cb: (online: boolean, provider: string) => void) {
    this.statusListeners.push(cb);
    cb(this.isConnected, this.activeProvider);
    return () => {
      this.statusListeners = this.statusListeners.filter((l) => l !== cb);
    };
  }

  private notifyStatus(online: boolean, provider: string) {
    this.statusListeners.forEach((l) => {
      try {
        l(online, provider);
      } catch {}
    });
  }

  public subscribe(cb: (event: RealtimeEvent) => void) {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  private notifyListeners(event: RealtimeEvent) {
    this.listeners.forEach((l) => {
      try {
        l(event);
      } catch (err) {
        console.error('Listener callback error:', err);
      }
    });
  }

  public publish(event: RealtimeEvent) {
    const wrapped: WrappedEvent = {
      ...event,
      _sender: this.clientId,
      _ts: Date.now(),
    };

    // 1. BroadcastChannel (같은 기기 / 멀티탭 테스트용 즉각 수신)
    if (this.bc) {
      try {
        this.bc.postMessage(wrapped);
      } catch {}
    }

    // 2. 네트워크 전송 (연결되어 있으면 즉시, 미연결 시 큐잉)
    if (this.isConnected) {
      this.sendToNetwork(wrapped);
    } else {
      this.queue.push(wrapped);
    }

    // 3. 로컬 리스너 즉시 반영
    this.notifyListeners(event);
  }

  public destroy() {
    this.isDestroyed = true;
    this.isConnected = false;

    if (this.mqttClient) {
      try {
        this.mqttClient.end(true);
      } catch {}
      this.mqttClient = null;
    }

    if (this.customWs) {
      try {
        this.customWs.close();
      } catch {}
      this.customWs = null;
    }

    if (this.bc) {
      try {
        this.bc.close();
      } catch {}
      this.bc = null;
    }

    this.listeners = [];
    this.statusListeners = [];
    this.queue = [];
  }
}
