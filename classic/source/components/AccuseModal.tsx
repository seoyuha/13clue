import { useState } from 'react';
import type { Card, CardColor, Category } from '../types';
import { CATEGORY_LABEL, CATEGORY_ORDER, cardsByCategory, COLOR_HEX } from '../data/cards';
import Modal from './Modal';
import CardView from './CardView';

interface Props {
  mysteryCards: Card[]; // player.outerCards
  removedColors?: CardColor[];
  onClose: () => void;
  onNewGame: () => void;
}

type Pick = Partial<Record<Category, string>>;

/**
 * 정답 확인 (사건 지목):
 * 인물·장소·흉기를 1장씩 골라 제출.
 * 정답 카드는 내 가림막 바깥에 놓인 3장의 카드.
 */
export default function AccuseModal({ mysteryCards, removedColors = [], onClose, onNewGame }: Props) {
  const [pick, setPick] = useState<Pick>({});
  const [result, setResult] = useState<'ok' | 'bad' | null>(null);
  const [tries, setTries] = useState(0);

  const complete = CATEGORY_ORDER.every((c) => pick[c]);

  const submit = () => {
    const correct = mysteryCards.every((m) => pick[m.category] === m.id);
    setTries((t) => t + 1);
    setResult(correct ? 'ok' : 'bad');
  };

  if (result === 'ok') {
    return (
      <Modal title="🎉 사건 해결 성공!" width={640}>
        <div className="result ok" style={{ textAlign: 'center', padding: '16px 0' }}>
          <div className="big" style={{ fontSize: 56 }}>🏆</div>
          <h2 style={{ color: 'var(--gold-bright)', margin: '8px 0' }}>정답입니다!</h2>
          <p className="desc" style={{ fontSize: 16 }}>
            명탐정님의 추리가 정확히 적중했습니다! 내 가림막에 꽂혀있던 정답 카드:
          </p>
        </div>
        <div className="result-cards" style={{ display: 'flex', gap: 12, justifyContent: 'center', margin: '16px 0' }}>
          {CATEGORY_ORDER.map((c) => {
            const card = mysteryCards.find((m) => m.category === c)!;
            return <CardView key={card.id} card={card} size="normal" />;
          })}
        </div>
        <div className="modal-foot">
          <button id="accuse-ok-close" className="btn btn-ghost" onClick={onClose}>
            게임 계속 보기
          </button>
          <button id="accuse-new-game" className="btn btn-gold" onClick={onNewGame}>
            새 게임 시작 (로비로) 🚪
          </button>
        </div>
      </Modal>
    );
  }

  if (result === 'bad') {
    return (
      <Modal title="정답 확인 결과" onClose={onClose} width={520}>
        <div className="result bad" style={{ textAlign: 'center', padding: '20px 0' }}>
          <div className="big" style={{ fontSize: 48 }}>🕵️</div>
          <h3 style={{ color: '#ff6b6b', margin: '12px 0' }}>아쉽지만 틀렸어요!</h3>
          <p className="desc" style={{ fontSize: 15, lineHeight: 1.6 }}>
            지목한 카드 중 적어도 하나가 정답과 일치하지 않습니다.<br />
            (어떤 카드가 틀렸는지는 비밀이에요!)<br />
            친구들의 질문과 답변을 더 수집한 뒤 다시 도전해보세요.
          </p>
        </div>
        <div className="modal-foot">
          <button id="accuse-bad-close" className="btn btn-ghost" onClick={onClose}>
            추리노트로 돌아가기
          </button>
          <button id="accuse-retry" className="btn btn-gold" onClick={() => setResult(null)}>
            다시 시도하기 ({tries}회 시도함)
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal title="⚖️ 사건 해결 선언 — 범인을 지목하세요!" onClose={onClose} width={860}>
      <p className="desc" style={{ marginBottom: 16 }}>
        내 가림막 바깥에 세워진 <b>[인물 1명, 장소 1곳, 흉기 1개]</b>를 각각 선택하세요.
      </p>

      <div className="accuse-cols">
        {CATEGORY_ORDER.map((cat) => (
          <div key={cat} className="accuse-col" data-cat={cat}>
            <h3>{CATEGORY_LABEL[cat]} 선택</h3>
            <div className="chip-list">
              {cardsByCategory(cat).map((card) => {
                const isRemoved = removedColors.includes(card.color);
                const isSelected = pick[cat] === card.id;
                const colorHex = COLOR_HEX[card.color] || '#888';

                return (
                  <button
                    key={card.id}
                    id={`accuse-${card.id}`}
                    className={`chip ${isSelected ? 'active' : ''} ${isRemoved ? 'removed' : ''}`}
                    disabled={isRemoved}
                    onClick={() => setPick((p) => ({ ...p, [cat]: card.id }))}
                    style={{
                      borderColor: isSelected ? 'var(--gold-bright)' : isRemoved ? '#444' : colorHex,
                    }}
                  >
                    <span className="chip-color-dot" style={{ backgroundColor: colorHex }} />
                    <span className="chip-emoji">{card.emoji}</span>
                    <span className="chip-name">{card.name}</span>
                    <span className="chip-attr">({card.attribute})</span>
                    {isRemoved && <span className="chip-tag">[제외됨]</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="modal-foot">
        <button id="accuse-cancel" className="btn btn-ghost" onClick={onClose}>
          취소
        </button>
        <button
          id="accuse-submit"
          className="btn btn-gold"
          disabled={!complete}
          onClick={submit}
        >
          {complete ? '정답 제출 및 최종 판결 ⚖️' : '인물·장소·흉기를 모두 선택하세요'}
        </button>
      </div>
    </Modal>
  );
}
