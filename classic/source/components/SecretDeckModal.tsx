import { useState } from 'react';
import type { Card, SecretCardSlot } from '../types';
import Modal from './Modal';
import CardView from './CardView';

interface Props {
  secretCards: SecretCardSlot[];
  tokens: number;
  isTwoPlayer: boolean;
  viewedSecrets?: Record<string, string>;
  onSpendToken: (letter: string) => void;
  onConfirmViewAndEndTurn: (letter: string, card: Card, autoMarkX: boolean) => void;
  onClose: () => void;
}

/**
 * 중앙 비밀정보원 열람 모달:
 * - 알파벳 타일(A, B, C, D...) 매핑
 * - 타일 선택 후 비공개 열람
 * - 확인 완료 시 자동으로 추리노트 X 체크 & 턴 종료(다음 탐정에게 차례 넘기기)
 */
export default function SecretDeckModal({
  secretCards,
  tokens,
  isTwoPlayer,
  viewedSecrets = {},
  onSpendToken,
  onConfirmViewAndEndTurn,
  onClose,
}: Props) {
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [revealed, setRevealed] = useState<{ letter: string; card: Card } | null>(null);
  const [autoMarkX, setAutoMarkX] = useState<boolean>(true);

  if (secretCards.length === 0) {
    return (
      <Modal title="중앙 비밀정보원" onClose={onClose} width={480}>
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <p className="desc" style={{ fontSize: 16 }}>
            6인 플레이에서는 중앙 비밀정보원 카드를 사용하지 않습니다.
          </p>
        </div>
        <div className="modal-foot">
          <button id="secret-empty-close" className="btn btn-gold" onClick={onClose}>
            닫기
          </button>
        </div>
      </Modal>
    );
  }

  // 카드를 확인하는 중인 화면 (사용자가 버튼을 누르기 전까지 절대 닫히거나 사라지지 않음)
  if (revealed !== null) {
    return (
      <Modal title={`비밀정보원 [${revealed.letter}] 타일 비공개 확인`} onClose={undefined} width={520}>
        <div style={{ textAlign: 'center', marginBottom: 14 }}>
          <p className="desc" style={{ fontSize: 16, color: 'var(--gold-bright)', margin: 0, fontWeight: 700 }}>
            🕵️ 나만 몰래 확인 중입니다!
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-dim)', margin: '4px 0 0' }}>
            카드를 충분히 살펴본 뒤 아래 <b>[확인 완료 및 턴 종료]</b>를 누르면 차례가 다음 사람에게 넘어갑니다.
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', margin: '14px 0' }}>
          <CardView card={revealed.card} size="large" label={`비밀정보원 타일 ${revealed.letter}`} />
        </div>

        {/* 내 추리노트 자동 체크 옵션 */}
        <div
          style={{
            marginTop: 16,
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(212, 175, 106, 0.12)',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
            <input
              type="checkbox"
              checked={autoMarkX}
              onChange={(e) => setAutoMarkX(e.target.checked)}
              style={{ width: 18, height: 18, accentColor: 'var(--gold)' }}
            />
            내 추리노트에 <b>[{revealed.card.name}]</b> (X) 자동 표시
          </label>
          <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>
            (정답 아님)
          </span>
        </div>

        <div style={{ marginTop: 12, textAlign: 'center', fontSize: 12, color: '#e2666b', fontWeight: 600 }}>
          ⚠️ 확인 완료를 누르면 다른 행동을 할 수 없으며 즉시 턴이 종료됩니다.
        </div>

        <div className="modal-foot" style={{ marginTop: 16 }}>
          <button
            id="secret-confirm-end-turn"
            className="btn btn-gold"
            style={{ width: '100%', padding: '14px 20px', fontSize: 16 }}
            onClick={() => {
              onConfirmViewAndEndTurn(revealed.letter, revealed.card, autoMarkX);
            }}
          >
            ✅ 확인 완료 및 턴 종료 (다음 친구에게 차례 넘기기)
          </button>
        </div>
      </Modal>
    );
  }

  const canReveal = isTwoPlayer || tokens > 0;

  const reveal = () => {
    if (selectedLetter === null || !canReveal) return;
    const slot = secretCards.find((s) => s.letter === selectedLetter);
    if (!slot) return;
    if (!isTwoPlayer) {
      onSpendToken(selectedLetter);
    }
    setRevealed(slot);
  };

  return (
    <Modal title="중앙 비밀정보원 열람" onClose={onClose} width={580}>
      <p className="desc" style={{ lineHeight: 1.5 }}>
        {isTwoPlayer ? (
          <>
            확인할 비밀정보원 <b>알파벳 타일</b>을 선택하세요.
            <br />
            <span style={{ color: 'var(--gold-bright)', fontSize: 13 }}>
              ℹ️ 비밀 카드를 확인하면 이번 턴이 즉시 종료되며 다음 플레이어에게 차례가 넘어갑니다.
            </span>
          </>
        ) : (
          <>
            확인할 비밀정보원 <b>알파벳 타일</b>을 선택하세요.
            열람 시 <b style={{ color: 'var(--gold-bright)' }}>돋보기 토큰 1개</b>가 소모됩니다.
            (현재 보유 토큰: <b>{tokens}개</b>)
            <br />
            <span style={{ color: 'var(--gold-bright)', fontSize: 13 }}>
              ℹ️ 비밀 카드를 확인하면 이번 턴이 즉시 종료되며 다음 플레이어에게 차례가 넘어갑니다.
            </span>
          </>
        )}
      </p>

      <div className="secret-grid" style={{ marginTop: 14 }}>
        {secretCards.map((slot) => {
          const isSel = selectedLetter === slot.letter;
          const alreadyViewedName = viewedSecrets[slot.letter];

          return (
            <button
              key={slot.letter}
              id={`secret-card-${slot.letter}`}
              className={`secret-tile-btn ${isSel ? 'selected' : ''}`}
              onClick={() => setSelectedLetter(slot.letter)}
              disabled={!canReveal}
              aria-label={`비밀정보원 타일 ${slot.letter}`}
              style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                padding: '6px 4px',
              }}
            >
              <div className="tile-badge" style={{ fontSize: 10, color: alreadyViewedName ? 'var(--ok)' : undefined }}>
                {alreadyViewedName ? '확인한 타일' : '비밀정보원'}
              </div>
              <div
                className="card-back tile-letter"
                style={{
                  width: 58,
                  height: 78,
                  fontSize: 22,
                  borderColor: alreadyViewedName ? 'var(--ok)' : undefined,
                }}
              >
                {slot.letter}
              </div>
              {alreadyViewedName && (
                <span
                  style={{
                    fontSize: 11,
                    color: 'var(--ok)',
                    fontWeight: 700,
                    background: 'rgba(111, 207, 143, 0.15)',
                    padding: '2px 6px',
                    borderRadius: 4,
                    maxWidth: 70,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  title={alreadyViewedName}
                >
                  {alreadyViewedName}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="modal-foot" style={{ marginTop: 20 }}>
        <button id="secret-cancel" className="btn btn-ghost" onClick={onClose}>
          취소 (닫기)
        </button>
        <button
          id="secret-reveal"
          className="btn btn-gold"
          disabled={selectedLetter === null || !canReveal}
          onClick={reveal}
        >
          {!canReveal
            ? '돋보기 토큰이 부족해요'
            : selectedLetter === null
            ? '타일을 선택하세요'
            : `비밀정보원 [${selectedLetter}] 열람하기 🔍`}
        </button>
      </div>
    </Modal>
  );
}
