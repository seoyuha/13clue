import type { PlayerState } from '../types';
import { CATEGORY_ORDER } from '../data/cards';
import CardView from './CardView';

interface Props {
  player: PlayerState;
  playerCount: number;
}

/**
 * 탭 1 — [바깥 화면 - 남에게 보여주기] (책상 위에 세워두는 뷰)
 * - 내 앞의 가림막 바깥쪽에 꽂힌 사건 카드 3장(인물, 장소, 흉기)을 화면 가득 크게 렌더링.
 * - 맞은편 친구가 멀리서도 볼 수 있도록 큰 글씨와 10가지 배경 색상, 범주 뱃지를 명확히 표시.
 * - 카테고리 순서(인물, 장소, 흉기)로 정렬하여 표시.
 */
export default function OuterView({ player, playerCount }: Props) {
  // 인물, 장소, 흉기 순으로 정렬하여 표시
  const sortedCards = [...player.outerCards].sort(
    (a, b) => CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category),
  );

  return (
    <section className="outer" aria-label="가림막 바깥 화면">
      <div className="outer-title">
        <div className="who">
          <span className="badge-seat">{player.id.replace('seat-', '')}번 탐정</span>
          <span className="player-name">{player.name}의 가림막 바깥 카드</span>
        </div>
        <div className="sub">
          👀 <b>친구에게 화면을 보여주세요!</b> (나 자신은 이 화면을 보면 안 됩니다) · {playerCount}인 게임
        </div>
      </div>

      <div className="outer-row n3">
        {sortedCards.map((card, i) => (
          <div key={card.id} className="outer-card-slot">
            <CardView
              card={card}
              size="large"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
