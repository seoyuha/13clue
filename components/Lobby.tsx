import { useState, useEffect, useRef } from 'react';
import { generateRoomCode, parseRoomCode, MIN_PLAYERS, MAX_PLAYERS } from '../logic/setupGame';
import { RealtimeChannel, CLIENT_ID } from '../logic/realtime';
import { YOUTUBE_INTRO_URL } from './VideoModal';

interface Props {
  onEnter: (roomId: string, seat: number, name: string, playerNames?: Record<number, string>) => void;
}

type Step =
  | { kind: 'home' }
  | { kind: 'created'; code: string }
  | { kind: 'seat'; code: string; isHost: boolean };

const COUNTS = Array.from({ length: MAX_PLAYERS - MIN_PLAYERS + 1 }, (_, i) => i + MIN_PLAYERS);

const RULE_HINT: Record<number, string> = {
  2: '2인 플레이: 12장 제외 (회색·갈색·보라·분홍) · 비밀정보원 8장 · 가림막 3장 · 손패 2장',
  3: '3인 플레이: 9장 제외 (회색·갈색·보라) · 비밀정보원 6장 · 가림막 3장 · 손패 2장',
  4: '4인 플레이: 6장 제외 (회색·갈색) · 비밀정보원 4장 · 가림막 3장 · 손패 2장',
  5: '5인 플레이: 3장 제외 (회색) · 비밀정보원 2장 · 가림막 3장 · 손패 2장',
  6: '6인 플레이: 제외 카드 없음 (30장 전체) · 비밀정보원 0장 · 가림막 3장 · 손패 2장',
};

export default function Lobby({ onEnter }: Props) {
  const [step, setStep] = useState<Step>({ kind: 'home' });
  const [count, setCount] = useState(4);
  const [digits, setDigits] = useState('');
  const [error, setError] = useState('');
  const [homeTab, setHomeTab] = useState<'join' | 'create'>('join');

  // ── 방 만들기 결과: 코드 안내 ──
  if (step.kind === 'created') {
    return (
      <main className="lobby">
        <div className="lobby-inner">
          <section className="panel lobby-box lobby-single">
            <h2>방이 생성되었습니다!</h2>
            <p className="hint">
              아래 <b>6자리 방 코드</b>를 친구들에게 알려주세요.<br />
              모든 친구가 같은 코드로 입장하면 동일한 카드 배분이 이뤄집니다.
            </p>
            <div className="big-code" id="created-room-code">{step.code}</div>
            <div className="ornament">{parseRoomCode(step.code)}인 공식 룰 게임</div>
            <p className="hint" style={{ fontSize: 13, color: 'var(--text-dim)', marginTop: 8 }}>
              {RULE_HINT[parseRoomCode(step.code) || 4]}
            </p>
            <div className="row-actions">
              <button id="created-back" className="btn btn-ghost" onClick={() => setStep({ kind: 'home' })}>
                ← 다시 설정
              </button>
              <button
                id="created-next"
                className="btn btn-gold"
                onClick={() => setStep({ kind: 'seat', code: step.code, isHost: true })}
              >
                내 자리 선택하기 (방장) →
              </button>
            </div>
          </section>
        </div>
      </main>
    );
  }

  // ── 자리 + 이름 선택 ──
  if (step.kind === 'seat') {
    return (
      <SeatPicker
        code={step.code}
        isHost={step.isHost}
        onBack={() => setStep({ kind: 'home' })}
        onEnter={onEnter}
      />
    );
  }

  // ── 홈: 방 만들기 / 입장 ──
  const press = (k: string) => {
    setError('');
    if (k === '⌫') setDigits((d) => d.slice(0, -1));
    else if (k === 'C') setDigits('');
    else setDigits((d) => (d.length < 6 ? d + k : d));
  };

  const join = () => {
    if (parseRoomCode(digits) === null) {
      setError('올바른 방 코드가 아닙니다. (첫 자리는 2~6)');
      return;
    }
    setStep({ kind: 'seat', code: digits, isHost: false });
  };

  return (
    <main className="lobby">
      <div className="lobby-inner">
        <header className="lobby-hero">
          <div className="emblem" aria-hidden>🔍</div>
          <h1>13개의 증거 탐정 디지털 툴킷</h1>
          <p>13개의 증거 보드게임 공식 룰 기반 · 가림막 · 비밀 손패 · 중앙 덱 · 추리노트</p>
          <div className="hero-yt-link">
            <a
              href={YOUTUBE_INTRO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="yt-guide-pill"
            >
              <span className="yt-icon">▶</span>
              <span>게임 소개 영상 보러가기 (YouTube)</span>
              <span className="yt-arrow">↗</span>
            </a>
          </div>
        </header>

        {/* 모바일 화면용 탭 전환: 스마트폰에서 100% 최적화된 원터치 선택 */}
        <div className="mobile-lobby-switch" role="tablist" aria-label="입장 모드 선택">
          <button
            type="button"
            role="tab"
            aria-selected={homeTab === 'join'}
            className={`switch-tab ${homeTab === 'join' ? 'active' : ''}`}
            onClick={() => setHomeTab('join')}
          >
            🗝️ 방 코드로 입장
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={homeTab === 'create'}
            className={`switch-tab ${homeTab === 'create' ? 'active' : ''}`}
            onClick={() => setHomeTab('create')}
          >
            🕯️ 새 방 만들기
          </button>
        </div>

        <div className={`lobby-cards active-tab-${homeTab}`}>
          {/* 새 방 만들기 카드 */}
          <section className={`panel lobby-box lobby-box-create ${homeTab === 'create' ? 'mobile-visible' : 'mobile-hidden'}`}>
            <h2>🕯️ 새 방 만들기</h2>
            <p className="hint">플레이 인원수를 선택하세요.</p>
            <div className="count-picker">
              {COUNTS.map((n) => (
                <button
                  key={n}
                  id={`count-${n}`}
                  className={count === n ? 'active' : ''}
                  onClick={() => setCount(n)}
                >
                  {n}
                  <small>명</small>
                </button>
              ))}
            </div>
            <p className="hint-rule">
              {RULE_HINT[count]}
            </p>
            <button
              id="create-room"
              className="btn btn-gold"
              style={{ marginTop: 'auto' }}
              onClick={() => setStep({ kind: 'created', code: generateRoomCode(count) })}
            >
              방 만들기 🗝️
            </button>
          </section>

          {/* 방 코드로 입장하기 카드 */}
          <section className={`panel lobby-box lobby-box-join ${homeTab === 'join' ? 'mobile-visible' : 'mobile-hidden'}`}>
            <h2>🗝️ 방 코드로 입장하기</h2>
            <p className="hint">방장이 만든 6자리 코드를 입력하세요.</p>
            <div className={`code-input ${error ? 'error' : ''}`} id="join-code-display">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} className={`digit ${i === digits.length ? 'focus' : ''}`}>
                  {digits[i] ?? ''}
                </div>
              ))}
            </div>
            <div className="keypad">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((k) => (
                <button key={k} id={`key-${k === '⌫' ? 'back' : k}`} onClick={() => press(k)}>
                  {k}
                </button>
              ))}
            </div>
            <p className="error-text">{error}</p>
            <button id="join-room" className="btn btn-gold" disabled={digits.length !== 6} onClick={join}>
              입장하기 →
            </button>
          </section>
        </div>
      </div>
    </main>
  );
}

interface OccupiedInfo {
  name: string;
  clientId: string;
}

function SeatPicker({
  code,
  isHost,
  onBack,
  onEnter,
}: {
  code: string;
  isHost: boolean;
  onBack: () => void;
  onEnter: (roomId: string, seat: number, name: string, playerNames?: Record<number, string>) => void;
}) {
  const playerCount = parseRoomCode(code) ?? 0;
  const [seat, setSeat] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [occupied, setOccupied] = useState<Record<number, OccupiedInfo>>({});
  const [warning, setWarning] = useState('');
  const [online, setOnline] = useState(false);
  const [providerName, setProviderName] = useState('연결 중...');
  const [showServerConfig, setShowServerConfig] = useState(false);
  const [customServerUrl, setCustomServerUrl] = useState(
    typeof localStorage !== 'undefined' ? localStorage.getItem('clues13_relay_server') || '' : '',
  );

  const channelRef = useRef<RealtimeChannel | null>(null);
  const seatRef = useRef<number | null>(null);
  const nameRef = useRef<string>('');

  seatRef.current = seat;
  nameRef.current = name;

  useEffect(() => {
    const channel = new RealtimeChannel(code, CLIENT_ID);
    channelRef.current = channel;

    const unsubStatus = channel.onStatus((isOnline, prov) => {
      setOnline(isOnline);
      setProviderName(prov);
    });

    const unsubEvents = channel.subscribe((e) => {
      if (e.type === 'START_GAME') {
        // 방장이 게임 시작을 누르면 모든 학생 동시 입장!
        const mySeat = seatRef.current;
        if (mySeat !== null) {
          onEnter(code, mySeat, nameRef.current.trim(), e.names);
        }
      } else if (e.type === 'CLAIM_SEAT') {
        setOccupied((prev) => ({
          ...prev,
          [e.seat]: { name: e.name || `${e.seat + 1}번 탐정`, clientId: e.clientId },
        }));
      } else if (e.type === 'RELEASE_SEAT') {
        setOccupied((prev) => {
          const next = { ...prev };
          if (next[e.seat]?.clientId === e.clientId) {
            delete next[e.seat];
          }
          return next;
        });
      } else if (e.type === 'SYNC_LOBBY') {
        setOccupied((prev) => ({ ...prev, ...e.seats }));
      } else if (e.type === 'REQ_LOBBY_SYNC') {
        // 새로 들어온 친구에게 내 자리 정보 응답
        const mySeat = seatRef.current;
        if (mySeat !== null) {
          channel.publish({
            type: 'CLAIM_SEAT',
            seat: mySeat,
            name: nameRef.current.trim() || `${mySeat + 1}번 탐정`,
            clientId: CLIENT_ID,
          });
        }
      }
    });

    // 1. 방 입장 즉시 기존 친구들에게 자리 현황 요청
    channel.publish({ type: 'REQ_LOBBY_SYNC', clientId: CLIENT_ID });

    // 2. 주기적 점유 신호 브로드캐스트 (실시간 동기화 보장)
    const pingTimer = setInterval(() => {
      const mySeat = seatRef.current;
      if (mySeat !== null) {
        channel.publish({
          type: 'CLAIM_SEAT',
          seat: mySeat,
          name: nameRef.current.trim() || `${mySeat + 1}번 탐정`,
          clientId: CLIENT_ID,
        });
      }
    }, 2500);

    return () => {
      clearInterval(pingTimer);
      const mySeat = seatRef.current;
      if (mySeat !== null) {
        channel.publish({ type: 'RELEASE_SEAT', seat: mySeat, clientId: CLIENT_ID });
      }
      unsubStatus();
      unsubEvents();
      channel.destroy();
    };
  }, [code, onEnter]);

  const selectSeat = (i: number) => {
    setWarning('');
    const occupier = occupied[i];

    // 다른 클라이언트가 이미 차지한 자리인 경우
    if (occupier && occupier.clientId !== CLIENT_ID) {
      setWarning(`[${i + 1}번 자리]는 이미 '${occupier.name}' 친구가 선택했습니다. 다른 자리를 골라주세요.`);
      return;
    }

    // 기존 자리 해제
    if (seat !== null && seat !== i) {
      channelRef.current?.publish({
        type: 'RELEASE_SEAT',
        seat,
        clientId: CLIENT_ID,
      });
    }

    setSeat(i);
    seatRef.current = i;
    channelRef.current?.publish({
      type: 'CLAIM_SEAT',
      seat: i,
      name: name.trim() || `${i + 1}번 탐정`,
      clientId: CLIENT_ID,
    });
  };

  const handleNameChange = (newName: string) => {
    setName(newName);
    nameRef.current = newName;
    if (seat !== null) {
      channelRef.current?.publish({
        type: 'CLAIM_SEAT',
        seat,
        name: newName.trim() || `${seat + 1}번 탐정`,
        clientId: CLIENT_ID,
      });
    }
  };

  // 전체 인원 준비 완료 여부 계산 (내 자리 선택 포함)
  const allOccupiedSeats: Record<number, OccupiedInfo> = { ...occupied };
  if (seat !== null) {
    allOccupiedSeats[seat] = {
      name: name.trim() || `${seat + 1}번 탐정`,
      clientId: CLIENT_ID,
    };
  }

  const readyCount = Object.keys(allOccupiedSeats).length;
  const isAllReady = readyCount >= playerCount;
  const missingCount = Math.max(0, playerCount - readyCount);

  // 모든 점유자 이름 맵 생성
  const collectAllNames = (): Record<number, string> => {
    const map: Record<number, string> = {};
    for (let i = 0; i < playerCount; i++) {
      map[i] = allOccupiedSeats[i]?.name || `${i + 1}번 탐정`;
    }
    return map;
  };

  // 방장이 게임 시작 버튼 누를 때
  const handleHostStart = () => {
    if (seat === null) {
      setWarning('방장님의 자리를 먼저 선택해 주세요!');
      return;
    }

    if (!isAllReady) {
      const ok = window.confirm(
        `아직 모든 친구가 자리를 선택하지 않았습니다. (현재 ${readyCount}/${playerCount}명 완료)\n` +
          `그래도 지금 게임을 시작하시겠습니까?`,
      );
      if (!ok) return;
    }

    const allNames = collectAllNames();
    channelRef.current?.publish({ type: 'START_GAME', names: allNames });
    onEnter(code, seat, name.trim(), allNames);
  };

  // 참가자가 직접 시작할 때 (네트워크 문제 대비 보조 수단)
  const handleGuestManualStart = () => {
    if (seat === null) return;
    const allNames = collectAllNames();
    onEnter(code, seat, name.trim(), allNames);
  };

  // 서버 설정 저장
  const handleSaveServerConfig = () => {
    if (customServerUrl.trim()) {
      localStorage.setItem('clues13_relay_server', customServerUrl.trim());
    } else {
      localStorage.removeItem('clues13_relay_server');
    }
    setShowServerConfig(false);
    window.location.reload();
  };

  return (
    <main className="lobby">
      <div className="lobby-inner">
        <section className="panel lobby-box lobby-single">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                padding: '4px 10px',
                borderRadius: 999,
                background: isHost ? 'rgba(234, 179, 8, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                color: isHost ? 'var(--gold-bright)' : 'var(--text-light)',
                border: isHost ? '1px solid var(--gold)' : '1px solid var(--border)',
              }}
            >
              {isHost ? '👑 방장 (호스트)' : '🕵️ 탐정 참가자'}
            </span>

            {/* 실시간 연결 상태 뱃지 및 설정 버튼 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '3px 8px',
                  borderRadius: 999,
                  background: online ? 'rgba(34, 197, 94, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                  color: online ? '#86efac' : 'var(--gold-bright)',
                  border: online ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(234,179,8,0.3)',
                }}
                title="실시간 네트워크 상태"
              >
                <span>{online ? '🟢' : '🟡'}</span>
                <span>{online ? providerName : '연결 중...'}</span>
              </span>

              <button
                type="button"
                onClick={() => setShowServerConfig(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-dim)',
                  cursor: 'pointer',
                  fontSize: 13,
                  padding: 2,
                }}
                title="실시간 서버 연결 설정"
              >
                ⚙️
              </button>
            </div>
          </div>

          <h2>방 [{code}] · 탐정 자리 선택</h2>
          <p className="hint">
            {playerCount}인 게임입니다. 친구들과 <b>서로 다른 번호의 자리</b>를 골라주세요.
            <span style={{ display: 'block', fontSize: 12, color: 'var(--gold-bright)', marginTop: 4 }}>
              👥 참여 현황: <b>{readyCount} / {playerCount}명 완료</b>
              {Object.keys(allOccupiedSeats).length > 0 && (
                <span style={{ color: 'var(--text)', marginLeft: 6 }}>
                  ({Object.entries(allOccupiedSeats).map(([s, inf]) => `${Number(s) + 1}번:${inf.name}`).join(', ')})
                </span>
              )}
            </span>
          </p>

          {warning && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.2)',
                color: '#fca5a5',
                padding: '8px 12px',
                borderRadius: 8,
                fontSize: 13,
                marginBottom: 12,
                border: '1px solid rgba(239,68,68,0.4)',
              }}
            >
              ⚠️ {warning}
            </div>
          )}

          {/* 자리 선택 그리드 (내 이름 및 친구 이름 실시간 반영) */}
          <div className="seat-grid">
            {Array.from({ length: playerCount }, (_, i) => {
              const occupier = allOccupiedSeats[i];
              const isMySeat = seat === i;
              const isTakenByOther = occupier && occupier.clientId !== CLIENT_ID;

              return (
                <button
                  key={i}
                  id={`seat-${i + 1}`}
                  className={`${isMySeat ? 'active' : ''} ${isTakenByOther ? 'occupied' : ''}`}
                  style={{
                    cursor: isTakenByOther ? 'not-allowed' : 'pointer',
                    opacity: isTakenByOther ? 0.75 : 1,
                    position: 'relative',
                  }}
                  onClick={() => selectSeat(i)}
                >
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: isMySeat ? 'var(--gold-bright)' : isTakenByOther ? '#f87171' : 'var(--text-dim)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      padding: '0 2px',
                    }}
                  >
                    {isMySeat
                      ? `⭐ 내 자리 (${name.trim() || '나'})`
                      : isTakenByOther
                      ? `👤 ${occupier.name}`
                      : '🟢 빈 자리'}
                  </div>
                  <b>{i + 1}번 자리</b>
                </button>
              );
            })}
          </div>

          <div style={{ marginTop: 12 }}>
            <label htmlFor="player-name" style={{ display: 'block', fontSize: 13, color: 'var(--gold)', marginBottom: 6 }}>
              🏷️ 내 이름 (친구들에게 표시됩니다):
            </label>
            <input
              id="player-name"
              className="text-field"
              placeholder="예: 김민수, 셜록홈즈"
              maxLength={10}
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
            />
          </div>

          {/* 인원 참여 상태 안내 배너 */}
          <div style={{ marginTop: 12 }}>
            {!isAllReady ? (
              <div
                style={{
                  textAlign: 'center',
                  fontSize: 13,
                  color: 'var(--gold)',
                  background: 'rgba(234, 179, 8, 0.1)',
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: '1px solid rgba(234, 179, 8, 0.25)',
                }}
              >
                ⏳ 아직 <b>{missingCount}명</b>의 친구가 자리를 선택하지 않았습니다. ({readyCount} / {playerCount}명 완료)
              </div>
            ) : (
              <div
                style={{
                  textAlign: 'center',
                  fontSize: 13,
                  color: '#86efac',
                  background: 'rgba(34, 197, 94, 0.15)',
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  fontWeight: 600,
                }}
              >
                ✨ 모든 탐정({playerCount}명)이 자리를 정했습니다! {isHost ? '방장님이 게임을 시작해주세요.' : '방장님의 시작을 기다리는 중입니다.'}
              </div>
            )}
          </div>

          {/* 방장/참가자 액션 버튼 영역: 방장은 자리만 고르면 언제든 게임 시작 가능 */}
          <div className="row-actions" style={{ flexDirection: 'column', gap: 10, marginTop: 16 }}>
            <div style={{ display: 'flex', width: '100%', gap: 10 }}>
              <button id="seat-back" className="btn btn-ghost" style={{ flex: 1 }} onClick={onBack}>
                ← 뒤로
              </button>

              {isHost ? (
                <button
                  id="start-game"
                  className="btn btn-gold"
                  style={{
                    flex: 2,
                    fontWeight: 800,
                    opacity: seat === null ? 0.5 : 1,
                    cursor: seat === null ? 'not-allowed' : 'pointer',
                  }}
                  disabled={seat === null}
                  onClick={handleHostStart}
                >
                  {seat === null
                    ? '👉 내 자리를 먼저 선택해 주세요'
                    : isAllReady
                    ? '게임 시작 🚀 (모든 탐정 준비 완료!)'
                    : `게임 시작하기 (${readyCount}/${playerCount}명 완료) ▶`}
                </button>
              ) : (
                <button
                  id="start-game"
                  className="btn btn-gold"
                  style={{ flex: 2, opacity: seat === null ? 0.5 : 1 }}
                  disabled={seat === null}
                  onClick={handleGuestManualStart}
                >
                  {seat === null
                    ? '자리를 선택해주세요'
                    : isAllReady
                    ? '모든 탐정 준비 완료! (방장 시작 대기 중 ⏳)'
                    : `대기 중 (친구 입장 중... ${readyCount}/${playerCount}명)`}
                </button>
              )}
            </div>

            {!isHost && seat !== null && (
              <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-dim)' }}>
                방장이 '게임 시작'을 누르면 자동으로 게임판이 열립니다.{' '}
                <button
                  type="button"
                  onClick={handleGuestManualStart}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--gold)',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    padding: 0,
                    fontSize: 12,
                  }}
                >
                  (반응이 없을 때 직접 시작)
                </button>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* 실시간 서버 설정 모달 (학교 스쿨넷 / 교실 Wi-Fi 로컬 서버 대응) */}
      {showServerConfig && (
        <div className="modal-backdrop">
          <div className="panel modal" style={{ width: 480, padding: 22 }}>
            <div className="modal-head">
              <h2>⚙️ 실시간 네트워크 서버 설정</h2>
              <button
                type="button"
                className="btn btn-ghost btn-icon"
                onClick={() => setShowServerConfig(false)}
              >
                ✕
              </button>
            </div>

            <p className="hint" style={{ fontSize: 13, lineHeight: 1.5, marginBottom: 14 }}>
              기본적으로 인터넷이 연결되어 있으면 <b>공개 클라우드 브로커(EMQX)</b>를 통해 별도 설정 없이 자동 연동됩니다.<br />
              만약 학교 방화벽(스쿨넷)으로 인해 외부 접속이 막힌 경우, 교사용 PC에서 <b>실시간_서버_실행.bat</b>을 실행한 후 표시되는 주소를 아래에 입력해주세요.
            </p>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--gold)', marginBottom: 6 }}>
                교실 로컬 WebSocket 서버 주소 (비워두면 기본 클라우드 사용):
              </label>
              <input
                className="text-field"
                placeholder="예: ws://192.168.0.23:8080"
                value={customServerUrl}
                onChange={(e) => setCustomServerUrl(e.target.value)}
              />
              <span style={{ display: 'block', fontSize: 11, color: 'var(--text-dim)', marginTop: 4 }}>
                * 비워두면 세계 최고 수준의 고속 공용 브로커(wss://broker.emqx.io:8084)로 자동 동작합니다.
              </span>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  setCustomServerUrl('');
                  localStorage.removeItem('clues13_relay_server');
                  setShowServerConfig(false);
                  window.location.reload();
                }}
              >
                기본값(클라우드)으로 초기화
              </button>
              <button type="button" className="btn btn-gold" onClick={handleSaveServerConfig}>
                저장 및 적용
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
