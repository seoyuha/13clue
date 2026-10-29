import { useState } from 'react';
import type { CardColor, Category, MarkState, PlayerState, SecretCardSlot } from '../types';
import {
  CATEGORY_LABEL,
  CATEGORY_ORDER,
  CARD_COLORS,
  COLOR_HEX,
  REMOVED_COLORS,
  cardByColor,
} from '../data/cards';
import CardView from './CardView';
import TableCardsView from './TableCardsView';

interface Props {
  mySeat: number;
  players: PlayerState[];
  currentTurnSeat: number;
  turnNumber: number;
  secretCards: SecretCardSlot[];
  tokens: number;
  marks: Record<string, MarkState>;
  recentLogs: string[];
  isMyTurn: boolean;
  viewedSecrets?: Record<string, string>;
  onToggleMark: (cardId: string) => void;
  onResetMarks: () => void;
  onChangeTokens: (delta: number) => void;
  onOpenSecret: () => void;
  onOpenAccuse: () => void;
  onEndTurn: () => void;
}

const MAX_TOKENS = 9;
const ATTR_SHORT: Record<string, string> = {
  남성: '남',
  여성: '여',
  실내: '실내',
  야외: '야외',
  근접: '근접',
  원거리: '원거리',
};

/**
 * 올인원 테이블 뷰 (통합 탐정 화면)
 * - 좌측 58%: 친구들의 사건 카드 3장(한눈에 확인) + 중앙 비밀정보원 + 내 손패(2장) & 숨겨진 내 사건(? 3장) + 턴 넘기기
 * - 우측 42%: 공식 10색 × 3열 인터랙티브 추리노트
 */
export default function InnerView(props: Props) {
  const {
    mySeat,
    players,
    currentTurnSeat,
    secretCards,
    tokens,
    marks,
    recentLogs,
    isMyTurn,
    viewedSecrets = {},
  } = props;

  const me = players[mySeat];
  const playerCount = players.length;
  const isTwoPlayer = playerCount === 2;
  const removedColors: CardColor[] = REMOVED_COLORS[playerCount] || [];
  const [mobileTab, setMobileTab] = useState<'board' | 'sheet'>('board');

  return (
    <section className={`unified-board mobile-view-${mobileTab}`} aria-label="메인 게임 화면">
      {/* 스마트폰 전용 상단 탭 전환: 모바일에서 테이블과 10색 추리노트를 원터치로 쾌적하게 전환 */}
      <div className="mobile-game-tabs" role="tablist" aria-label="모바일 게임 화면 탭">
        <button
          type="button"
          role="tab"
          aria-selected={mobileTab === 'board'}
          className={`mobile-tab-btn ${mobileTab === 'board' ? 'active' : ''}`}
          onClick={() => setMobileTab('board')}
        >
          🎴 테이블 & 내 손패
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mobileTab === 'sheet'}
          className={`mobile-tab-btn ${mobileTab === 'sheet' ? 'active' : ''}`}
          onClick={() => setMobileTab('sheet')}
        >
          🖋️ 추리노트 (10색)
        </button>
      </div>

      {/* ── 좌측 58%: 메인 테이블 & 개인 영역 ── */}
      <div className="board-left-table">
        {/* 1. 친구들의 가림막 사건 카드 (한눈에 보기!) */}
        <TableCardsView
          mySeat={mySeat}
          players={players}
          currentTurnSeat={currentTurnSeat}
        />

        {/* 2. 중앙 비밀정보원 & 활동 피드 */}
        <div className="table-center-row">
          {/* 중앙 비밀정보원 */}
          <div className="panel mini-panel center-secret-box">
            <div className="section-title">
              <span>🗃️ 중앙 비밀정보원</span>
              <span className="count">{secretCards.length}장</span>
            </div>

            {secretCards.length > 0 ? (
              <div className="secret-flex">
                <div className="secret-tile-badges">
                  {secretCards.map((slot) => {
                    const knownCard = viewedSecrets[slot.letter];
                    return (
                      <span
                        key={slot.letter}
                        className={`tile-pill ${knownCard ? 'viewed' : ''}`}
                        style={
                          knownCard
                            ? {
                                width: 'auto',
                                padding: '2px 8px',
                                background: 'rgba(111, 207, 143, 0.2)',
                                borderColor: 'var(--ok)',
                                color: 'var(--ok)',
                                fontWeight: 700,
                              }
                            : undefined
                        }
                        title={knownCard ? `내가 확인한 카드: ${knownCard}` : `비밀정보원 타일 ${slot.letter}`}
                      >
                        {slot.letter}
                        {knownCard && ` (${knownCard})`}
                      </span>
                    );
                  })}
                </div>
                <div className="secret-action-row">
                  <span className="secret-rule-text" style={{ fontSize: 11, color: isMyTurn ? 'var(--gold-bright)' : 'var(--text-dim)' }}>
                    {isTwoPlayer
                      ? '내 차례에 1장 비공개 확인 (확인 즉시 차례 넘어감)'
                      : '내 차례에 토큰 1개 소모 후 확인 (확인 즉시 차례 넘어감)'}
                  </span>
                  <button
                    id="open-secret"
                    className={`btn ${isMyTurn && (isTwoPlayer || tokens > 0) ? 'btn-gold' : 'btn-ghost'}`}
                    style={{ padding: '8px 14px', fontSize: 13 }}
                    disabled={!isMyTurn || (!isTwoPlayer && tokens <= 0)}
                    onClick={props.onOpenSecret}
                    title={!isMyTurn ? '내 차례에만 열람할 수 있습니다' : (!isTwoPlayer && tokens <= 0) ? '돋보기 토큰이 부족합니다' : '비밀정보원 열람'}
                  >
                    {isMyTurn ? '비밀정보원 열람 🔍' : '비밀정보원 열람 (차례 대기)'}
                  </button>
                </div>

                {/* 내가 이미 확인한 비밀정보원 요약 배너 */}
                {Object.keys(viewedSecrets).length > 0 && (
                  <div
                    style={{
                      marginTop: 6,
                      padding: '5px 10px',
                      borderRadius: 6,
                      background: 'rgba(111, 207, 143, 0.15)',
                      border: '1px solid var(--ok)',
                      fontSize: 12,
                      color: 'var(--ok)',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      flexWrap: 'wrap',
                    }}
                  >
                    <span>🕵️ 내가 확인한 단서:</span>
                    {Object.entries(viewedSecrets).map(([ltr, cardName]) => (
                      <span
                        key={ltr}
                        style={{
                          background: 'rgba(0, 0, 0, 0.3)',
                          padding: '2px 7px',
                          borderRadius: 4,
                          color: '#fff',
                        }}
                      >
                        <b>[{ltr}]</b> {cardName}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ padding: '8px 0', textAlign: 'center', color: 'var(--text-dim)', fontSize: 13 }}>
                6인 게임은 비밀 카드를 사용하지 않습니다.
              </div>
            )}
          </div>

          {/* 최근 활동 로그 */}
          <div className="panel mini-panel activity-feed-box">
            <div className="section-title">
              <span>📜 실시간 활동 기록</span>
            </div>
            <div className="log-list">
              {recentLogs.length > 0 ? (
                recentLogs.slice(-3).map((log, i) => (
                  <div key={i} className="log-item">
                    • {log}
                  </div>
                ))
              ) : (
                <div className="log-empty">게임이 시작되었습니다. 차례대로 질문을 진행하세요!</div>
              )}
            </div>
          </div>
        </div>

        {/* 3. 내 자리 (화면 하단) */}
        <div className="panel my-seat-dock">
          <div className="dock-grid">
            {/* 3-A. 내 사건 카드: 나에게는 절대 보이지 않고 '?'로만 표시됨! */}
            <div className="my-mystery-box">
              <div className="dock-subtitle">
                <span>❓ 내 사건 카드 (나에게는 보이지 않음)</span>
                <span className="dock-subhint">친구들 화면에만 보입니다</span>
              </div>
              <div className="mystery-cards-row">
                {['인물', '장소', '흉기'].map((cat, i) => (
                  <div key={i} className="hidden-card-slot" title="친구들에게만 보이는 내 사건 카드">
                    <div className="q-mark">?</div>
                    <span className="q-cat">{cat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 3-B. 내 비밀 손패 2장: 나만 볼 수 있는 카드 앞면 */}
            <div className="my-hand-box">
              <div className="dock-subtitle">
                <span>🂠 내 비밀 손패 (나만 보기)</span>
                <span className="dock-subhint">내 사건의 정답이 아닙니다</span>
              </div>
              <div className="hand-row">
                {me.innerCards.map((c, idx) => (
                  <div key={c.id} className="hand-card-slot">
                    <div className={`hand-slot-tag ${idx === 0 ? 'slot-left' : 'slot-right'}`}>
                      {idx === 0 ? '👈 왼쪽' : '👉 오른쪽'}
                    </div>
                    <CardView card={c} size="small" />
                  </div>
                ))}
              </div>
            </div>

            {/* 3-C. 토큰 관리 & 차례 액션 */}
            <div className="my-controls-box">
              {!isTwoPlayer && (
                <div className="token-row-inline">
                  <span className="token-label">🔍 돋보기 토큰</span>
                  <div className="token-stepper">
                    <button
                      className="btn-stepper"
                      disabled={tokens <= 0}
                      onClick={() => props.onChangeTokens(-1)}
                    >
                      −
                    </button>
                    <span className="token-val">{tokens}</span>
                    <button
                      className="btn-stepper"
                      disabled={tokens >= MAX_TOKENS}
                      onClick={() => props.onChangeTokens(1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* 턴 종료 버튼 (내 차례일 때만 강조) */}
              <button
                id="end-turn-btn"
                className={`btn ${isMyTurn ? 'btn-gold pulse-btn' : 'btn-ghost'}`}
                style={{ width: '100%', padding: '10px 12px', fontSize: 14 }}
                disabled={!isMyTurn}
                onClick={props.onEndTurn}
              >
                {isMyTurn ? '차례 마치기 (턴 넘김) ⏭️' : `⏳ ${players[currentTurnSeat]?.name || `${currentTurnSeat + 1}번 탐정`} 차례 대기 중`}
              </button>

              {!isMyTurn && (
                <div style={{ textAlign: 'center', marginTop: 4 }}>
                  <button
                    type="button"
                    onClick={() => {
                      const nextName = players[currentTurnSeat]?.name || `${currentTurnSeat + 1}번 탐정`;
                      if (window.confirm(`${nextName} 친구가 응답이 없나요? 다음 탐정에게 차례를 수동으로 넘길까요?`)) {
                        props.onEndTurn();
                      }
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-dim)',
                      fontSize: 11,
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      padding: 2,
                    }}
                  >
                    (친구 미응답 시 턴 수동 넘기기 ⏩)
                  </button>
                </div>
              )}

              {/* 사건 해결 버튼 */}
              <button
                id="open-accuse"
                className="btn btn-ghost"
                style={{
                  width: '100%',
                  marginTop: 6,
                  padding: '9px 12px',
                  fontSize: 13,
                  borderColor: 'var(--gold-deep)',
                }}
                onClick={props.onOpenAccuse}
              >
                ⚖️ 사건 해결 (정답 지목)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── 우측 42%: 인터랙티브 추리노트 (항시 표시) ── */}
      <div className="panel sheet unified-sheet">
        <div className="sheet-head">
          <div style={{ display: 'flex', alignItems: 'baseline' }}>
            <h2>🖋️ 인터랙티브 추리노트</h2>
            <span className="legend">
              터치: 빈칸 → <b style={{ color: 'var(--bad)' }}>X(제외)</b> →{' '}
              <b style={{ color: 'var(--gold-bright)' }}>O(확정)</b>
            </span>
          </div>
          <button
            id="reset-sheet"
            className="btn btn-ghost"
            style={{ padding: '6px 12px', fontSize: 12 }}
            onClick={() => {
              if (window.confirm('추리노트의 모든 체크를 초기화할까요?')) {
                props.onResetMarks();
              }
            }}
          >
            ↺ 초기화
          </button>
        </div>

        <div className="sheet-grid">
          {/* 1행: 헤더 */}
          <div className="sheet-hdr" style={{ color: 'var(--gold)' }}>색깔</div>
          <div className="sheet-hdr person">{CATEGORY_LABEL.PERSON}</div>
          <div className="sheet-hdr location">{CATEGORY_LABEL.LOCATION}</div>
          <div className="sheet-hdr weapon">{CATEGORY_LABEL.WEAPON}</div>

          {/* 10개 색깔 행 */}
          {CARD_COLORS.map((color) => {
            const isColorExcluded = removedColors.includes(color);
            const colorHex = COLOR_HEX[color];

            return (
              <SheetRow
                key={color}
                color={color}
                colorHex={colorHex}
                isExcluded={isColorExcluded}
                marks={marks}
                onToggleMark={props.onToggleMark}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

function SheetRow({
  color,
  colorHex,
  isExcluded,
  marks,
  onToggleMark,
}: {
  color: CardColor;
  colorHex: string;
  isExcluded: boolean;
  marks: Record<string, MarkState>;
  onToggleMark: (id: string) => void;
}) {
  return (
    <>
      {/* 색깔 라벨 */}
      <div
        className={`sheet-color ${isExcluded ? 'excluded' : ''}`}
        style={{
          borderLeft: `4px solid ${colorHex}`,
          background: isExcluded ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.02)',
        }}
        title={isExcluded ? `${color} (이번 게임 제외)` : color}
      >
        <span className="swatch" style={{ background: colorHex }} />
        <span style={{ fontSize: 11, fontWeight: 700 }}>
          {color.replace('색', '')}
          {isExcluded && <small style={{ display: 'block', fontSize: 9, color: 'var(--bad)' }}>제외</small>}
        </span>
      </div>

      {/* 3개 카테고리 카드 셀 */}
      {CATEGORY_ORDER.map((category: Category) => {
        const card = cardByColor(color, category);
        if (!card) return <div key={category} className="sheet-cell empty" />;

        const m = marks[card.id] ?? '';

        return (
          <button
            key={card.id}
            id={`sheet-${card.id}`}
            className={`sheet-cell ${isExcluded ? 'excluded' : ''}`}
            data-mark={isExcluded ? '' : m}
            disabled={isExcluded}
            onClick={() => !isExcluded && onToggleMark(card.id)}
            aria-label={`${color} ${card.name} (${card.attribute}) ${isExcluded ? '제외됨' : m}`}
            style={{
              borderLeft: isExcluded ? undefined : `2px solid ${colorHex}55`,
            }}
          >
            <span style={{ fontSize: 15 }} aria-hidden>
              {card.emoji}
            </span>
            <span className="label">
              <span className="name-text">{card.name}</span>
              <span className="sub">
                {ATTR_SHORT[card.attribute] || card.attribute}
              </span>
            </span>
            {!isExcluded && <span className="mark">{m}</span>}
            {isExcluded && <span style={{ fontSize: 10, color: 'var(--text-faint)' }}>제외</span>}
          </button>
        );
      })}
    </>
  );
}
