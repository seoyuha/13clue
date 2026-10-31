import type { PlayerState } from '../types';
import CardView from './CardView';

interface Props {
  mySeat: number;
  players: PlayerState[];
  currentTurnSeat: number;
}

/**
 * 테이블 뷰:
 * - 내 사건 카드는 완전히 숨겨짐 (? 뒷면)
 * - 다른 모든 친구들의 사건 카드 3장(인물, 장소, 흉기)이 한눈에 큼직하게 펼쳐짐!
 * - 3인 플레이 시: 왼쪽 친구 3장 & 오른쪽 친구 3장 명확히 구분
 */
export default function TableCardsView({ mySeat, players, currentTurnSeat }: Props) {
  const playerCount = players.length;
  // 나를 제외한 다른 플레이어들 (자리 순서대로)
  const otherPlayers = players.filter((_, idx) => idx !== mySeat);

  // 3인 플레이일 때: 왼쪽 친구 = (mySeat + 1) % 3, 오른쪽 친구 = (mySeat + 2) % 3
  const getNeighborLabel = (seatIdx: number) => {
    if (playerCount === 2) return '맞은편 친구';
    if (playerCount === 3) {
      if (seatIdx === (mySeat + 1) % 3) return '👈 왼쪽 친구';
      if (seatIdx === (mySeat + 2) % 3) return '👉 오른쪽 친구';
    }
    return `${seatIdx + 1}번 자리 친구`;
  };

  return (
    <div className="table-friends-area">
      <div className="table-area-title">
        <span>👀 친구들의 가림막 사건 카드 (한눈에 확인하기)</span>
        <span className="sub-hint">친구에게 질문할 때 이 카드들을 세어보세요!</span>
      </div>

      <div className={`friends-grid count-${otherPlayers.length}`}>
        {otherPlayers.map((p) => {
          const originalSeatIdx = players.findIndex((orig) => orig.id === p.id);
          const isTurn = currentTurnSeat === originalSeatIdx;
          const relation = getNeighborLabel(originalSeatIdx);

          return (
            <div key={p.id} className={`friend-cards-box ${isTurn ? 'turn-active' : ''}`}>
              <div className="friend-head">
                <div className="friend-badge">
                  <span className="relation-tag">{relation}</span>
                  <span className="friend-name">{p.name || `${originalSeatIdx + 1}번 탐정`}</span>
                </div>
                {isTurn && <span className="turn-pill">🎯 현재 차례</span>}
              </div>

              <div className="friend-cards-row">
                {p.outerCards.map((c) => (
                  <CardView key={c.id} card={c} size="small" />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
