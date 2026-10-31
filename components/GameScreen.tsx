import { useEffect, useMemo, useRef, useState } from 'react';
import type { MarkState, SavedSession } from '../types';
import { setupGame } from '../logic/setupGame';
import { RealtimeChannel, type RealtimeEvent } from '../logic/realtime';
import InnerView from './InnerView';
import SecretDeckModal from './SecretDeckModal';
import AccuseModal from './AccuseModal';
import RulesModal from './RulesModal';

interface Props {
  session: SavedSession;
  onUpdate: (s: SavedSession) => void;
  onExit: () => void;
}

type ModalKind = 'secret' | 'accuse' | 'rules' | null;
const NEXT_MARK: Record<MarkState, MarkState> = { '': 'X', X: 'O', O: '' };

export default function GameScreen({ session, onUpdate, onExit }: Props) {
  const room = useMemo(() => setupGame(session.roomId), [session.roomId]);
  const player = room.players[session.seat];
  const displayName = session.name || player.name;

  // 실시간 플레이어 이름 맵 동기화
  const [playerNames, setPlayerNames] = useState<Record<number, string>>(session.playerNames || {});
  const [online, setOnline] = useState<boolean>(false);
  const [providerName, setProviderName] = useState<string>('연결 중...');

  // 실시간 턴 상태 (기본 0번 탐정부터 시작)
  const [currentTurnSeat, setCurrentTurnSeat] = useState<number>(0);
  const [turnNumber, setTurnNumber] = useState<number>(1);
  const [modal, setModal] = useState<ModalKind>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [accuseBroadcast, setAccuseBroadcast] = useState<{
    name: string;
    isCorrect: boolean;
  } | null>(null);

  // 실시간 통신 채널 연결
  const channelRef = useRef<RealtimeChannel | null>(null);

  // room.players에 최신 플레이어 실시간 이름 반영
  room.players.forEach((p, idx) => {
    if (idx === session.seat && session.name) {
      p.name = session.name;
    } else if (playerNames[idx]) {
      p.name = playerNames[idx];
    }
  });

  useEffect(() => {
    const channel = new RealtimeChannel(session.roomId);
    channelRef.current = channel;

    const unsubStatus = channel.onStatus((isOnline, prov) => {
      setOnline(isOnline);
      setProviderName(prov);
    });

    const unsubscribe = channel.subscribe((event: RealtimeEvent) => {
      if (event.type === 'NEXT_TURN') {
        setCurrentTurnSeat(event.turnSeat);
        setTurnNumber(event.turnNumber);
        const turnPlayerName = room.players[event.turnSeat]?.name || `${event.turnSeat + 1}번 탐정`;
        addLog(`🎯 ${turnPlayerName}의 차례가 되었습니다. (턴 ${event.turnNumber})`);
      } else if (event.type === 'SECRET_VIEW') {
        const viewerName = room.players[event.seat]?.name || `${event.seat + 1}번 탐정`;
        addLog(`🗃️ ${viewerName}이(가) 비밀정보원 타일 [${event.letter}]을 확인했습니다.`);
      } else if (event.type === 'ACCUSE_RESULT') {
        if (event.seat !== session.seat) {
          setAccuseBroadcast({ name: event.name, isCorrect: event.isCorrect });
        }
        addLog(
          event.isCorrect
            ? `🏆 ${event.name}이(가) 사건을 해결하고 승리했습니다!`
            : `🕵️ ${event.name}이(가) 사건 해결에 도전했으나 실패했습니다.`,
        );
      } else if (event.type === 'JOIN') {
        setPlayerNames((prev) => {
          const next = { ...prev, [event.seat]: event.name };
          return next;
        });
        addLog(`👋 ${event.name} 탐정이 입장했습니다.`);
        // 방에 있던 내가 새로 들어온 친구에게 내 이름 응답 전송
        channel.publish({ type: 'PING', seat: session.seat, name: displayName });
      } else if (event.type === 'PING') {
        setPlayerNames((prev) => ({ ...prev, [event.seat]: event.name }));
      } else if (event.type === 'START_GAME' && event.names) {
        setPlayerNames((prev) => ({ ...prev, ...event.names }));
      }
    });

    // 방 입장 알림 전파 (내 이름 및 자리 브로드캐스트)
    channel.publish({ type: 'JOIN', seat: session.seat, name: displayName });

    return () => {
      unsubStatus();
      unsubscribe();
      channel.destroy();
    };
  }, [session.roomId, session.seat, displayName]);

  const addLog = (text: string) => {
    setLogs((prev) => [...prev, text]);
  };

  const isMyTurn = currentTurnSeat === session.seat;
  const currentTurnPlayer = room.players[currentTurnSeat];
  const currentTurnName = currentTurnPlayer?.name || `${currentTurnSeat + 1}번 탐정`;

  // 턴 종료 (다음 사람에게 넘기기)
  const handleEndTurn = (forced = false) => {
    if (!forced && !isMyTurn) return;
    const nextSeat = (currentTurnSeat + 1) % room.playerCount;
    const nextTurnNum = turnNumber + 1;

    // 로컬 즉시 반영 (0ms)
    setCurrentTurnSeat(nextSeat);
    setTurnNumber(nextTurnNum);
    const nextPlayerName = room.players[nextSeat]?.name || `${nextSeat + 1}번 탐정`;
    addLog(`🎯 ${nextPlayerName}의 차례가 되었습니다. (턴 ${nextTurnNum})`);

    // 모든 학생 기기로 실시간 브로드캐스트 전파!
    channelRef.current?.publish({
      type: 'NEXT_TURN',
      turnSeat: nextSeat,
      turnNumber: nextTurnNum,
    });
  };

  // 비밀정보원 열람 시작 (토큰 소모 및 알림)
  const handleSpendToken = (letter: string) => {
    if (room.playerCount > 2) {
      onUpdate({ ...session, tokens: Math.max(0, session.tokens - 1) });
    }
    channelRef.current?.publish({
      type: 'SECRET_VIEW',
      seat: session.seat,
      letter,
    });
  };

  // 비밀정보원 확인 완료 -> 기억 저장, 추리노트 X 체크, 모달 닫기, 즉시 턴 넘기기!
  const handleConfirmSecretAndEndTurn = (letter: string, card: any, autoMarkX: boolean) => {
    const nextViewed = { ...(session.viewedSecrets || {}), [letter]: card.name };
    const nextMarks = autoMarkX ? { ...session.marks, [card.id]: 'X' as MarkState } : session.marks;

    onUpdate({
      ...session,
      viewedSecrets: nextViewed,
      marks: nextMarks,
      playerNames,
    });

    setModal(null);
    addLog(`🗃️ 비밀정보원 [${letter}] 타일을 확인하고 차례를 마쳤습니다.`);

    // 즉시 다음 탐정에게 턴 넘기기
    const nextSeat = (currentTurnSeat + 1) % room.playerCount;
    const nextTurnNum = turnNumber + 1;
    setCurrentTurnSeat(nextSeat);
    setTurnNumber(nextTurnNum);

    channelRef.current?.publish({
      type: 'NEXT_TURN',
      turnSeat: nextSeat,
      turnNumber: nextTurnNum,
    });
  };

  const update = (patch: Partial<SavedSession>) => onUpdate({ ...session, playerNames, ...patch });

  return (
    <div className="game table-game-layout">
      {/* ── 상단 탑바: 턴 알림 & 실시간 온라인 상태 ── */}
      <header className="topbar">
        <div className="brand">
          <strong>🔍 13개의 증거</strong>
          <span>
            방 <b>{session.roomId}</b> · {session.seat + 1}번 자리 {session.name && `(${session.name})`}
          </span>
        </div>

        {/* 중앙 턴 배너 */}
        <div className={`turn-banner ${isMyTurn ? 'my-turn' : ''}`}>
          <span className="turn-count-badge">턴 {turnNumber}</span>
          <span className="turn-text">
            {isMyTurn ? (
              <b className="highlight-my-turn">🎯 내 차례입니다! 질문을 하거나 행동을 선택하세요.</b>
            ) : (
              <>
                ⏳ 현재 <b>{currentTurnName}</b>의 차례입니다.
              </>
            )}
          </span>
          <span className="online-pulse-dot" title="실시간 온라인 연동됨">
            🟢
          </span>
        </div>

        <div className="topbar-actions">
          <button
            id="help-button"
            className="btn btn-ghost btn-icon"
            style={{ fontFamily: 'var(--font-serif)', fontWeight: 700 }}
            onClick={() => setModal('rules')}
            aria-label="게임 규칙 보기"
          >
            ?
          </button>
          <button
            id="exit-game"
            className="btn btn-ghost"
            style={{ padding: '8px 14px', fontSize: 13 }}
            onClick={() => {
              if (window.confirm('로비로 나갈까요? 현재 추리노트와 토큰 기록이 초기화됩니다.')) {
                onExit();
              }
            }}
          >
            🚪 나가기
          </button>
        </div>
      </header>

      {/* ── 메인 올인원 테이블 뷰 ── */}
      <main className="stage unified-stage">
        <InnerView
          mySeat={session.seat}
          players={room.players}
          currentTurnSeat={currentTurnSeat}
          turnNumber={turnNumber}
          secretCards={room.secretCards}
          tokens={session.tokens}
          marks={session.marks}
          recentLogs={logs}
          isMyTurn={isMyTurn}
          viewedSecrets={session.viewedSecrets || {}}
          onToggleMark={(id) =>
            update({ marks: { ...session.marks, [id]: NEXT_MARK[session.marks[id] ?? ''] } })
          }
          onResetMarks={() => update({ marks: {} })}
          onChangeTokens={(d) => update({ tokens: Math.max(0, session.tokens + d) })}
          onOpenSecret={() => setModal('secret')}
          onOpenAccuse={() => setModal('accuse')}
          onEndTurn={handleEndTurn}
        />
      </main>

      {/* 모달들 */}
      {modal === 'secret' && (
        <SecretDeckModal
          secretCards={room.secretCards}
          tokens={session.tokens}
          isTwoPlayer={room.playerCount === 2}
          viewedSecrets={session.viewedSecrets || {}}
          onSpendToken={handleSpendToken}
          onConfirmViewAndEndTurn={handleConfirmSecretAndEndTurn}
          onClose={() => setModal(null)}
        />
      )}

      {modal === 'accuse' && (
        <AccuseModal
          mysteryCards={player.outerCards}
          removedColors={room.removedCards.map((c) => c.color)}
          onClose={() => setModal(null)}
          onNewGame={onExit}
        />
      )}

      {modal === 'rules' && <RulesModal onClose={() => setModal(null)} />}

      {/* 다른 플레이어의 사건 해결 결과 알림 팝업 */}
      {accuseBroadcast && (
        <div className="modal-backdrop">
          <div className="panel modal" style={{ width: 440, textAlign: 'center', padding: '24px' }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>
              {accuseBroadcast.isCorrect ? '🏆' : '🕵️'}
            </div>
            <h3>
              {accuseBroadcast.isCorrect
                ? `${accuseBroadcast.name} 탐정이 사건을 해결했습니다!`
                : `${accuseBroadcast.name} 탐정이 사건 해결에 실패했습니다.`}
            </h3>
            <p className="desc" style={{ marginTop: 8 }}>
              {accuseBroadcast.isCorrect
                ? '명탐정 탄생! 게임이 종료되었습니다.'
                : '틀린 단서가 있습니다. 차례를 계속 진행합니다.'}
            </p>
            <div className="modal-foot" style={{ marginTop: 16 }}>
              <button className="btn btn-gold" onClick={() => setAccuseBroadcast(null)}>
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
