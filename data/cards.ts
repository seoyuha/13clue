import type { Card, CardColor, Category } from '../types';

export const CATEGORY_LABEL: Record<Category, string> = {
  PERSON: '인물',
  LOCATION: '장소',
  WEAPON: '흉기',
};

export const CATEGORY_ORDER: Category[] = ['PERSON', 'LOCATION', 'WEAPON'];

/** 색깔 표시 순서 (추리노트 표시용) */
export const CARD_COLORS: CardColor[] = [
  '빨간색', '주황색', '노란색', '초록색', '파란색',
  '보라색', '분홍색', '흰색', '갈색', '회색',
];

/** UI에서 사용할 CSS 색상 값 */
export const COLOR_HEX: Record<CardColor, string> = {
  '보라색': '#9B59B6',
  '분홍색': '#E84393',
  '빨간색': '#E74C3C',
  '초록색': '#2ECC71',
  '노란색': '#F1C40F',
  '파란색': '#3498DB',
  '주황색': '#E67E22',
  '흰색': '#BDC3C7',
  '갈색': '#A1887F',
  '회색': '#95A5A6',
};

/** 인원수별 제외 색깔 (회색부터 순서대로) */
export const REMOVED_COLORS: Record<number, CardColor[]> = {
  2: ['회색', '갈색', '보라색', '분홍색'],
  3: ['회색', '갈색', '보라색'],
  4: ['회색', '갈색'],
  5: ['회색'],
  6: [],
};

/**
 * 13개의 증거 공식 카드 30장
 * 색깔당 인물 1장, 장소 1장, 흉기 1장 = 3장
 */
export const CARDS: Card[] = [
  // ── 보라색: 선원 / 선착장 / 독약 ──
  { id: 'p-sailor',   name: '선원',     category: 'PERSON',   attribute: '남성',   color: '보라색', emoji: '⚓' },
  { id: 'l-dock',     name: '선착장',   category: 'LOCATION', attribute: '야외',   color: '보라색', emoji: '⛴️' },
  { id: 'w-poison',   name: '독약',     category: 'WEAPON',   attribute: '원거리', color: '보라색', emoji: '☠️' },
  // ── 분홍색: 귀부인 / 공원 / 폭탄 ──
  { id: 'p-lady',     name: '귀부인',   category: 'PERSON',   attribute: '여성',   color: '분홍색', emoji: '👒' },
  { id: 'l-park',     name: '공원',     category: 'LOCATION', attribute: '야외',   color: '분홍색', emoji: '🌳' },
  { id: 'w-bomb',     name: '폭탄',     category: 'WEAPON',   attribute: '원거리', color: '분홍색', emoji: '💣' },
  // ── 빨간색: 장교 / 시장 / 석궁 ──
  { id: 'p-officer',  name: '장교',     category: 'PERSON',   attribute: '남성',   color: '빨간색', emoji: '🎖️' },
  { id: 'l-market',   name: '시장',     category: 'LOCATION', attribute: '야외',   color: '빨간색', emoji: '🧺' },
  { id: 'w-crossbow', name: '석궁',     category: 'WEAPON',   attribute: '원거리', color: '빨간색', emoji: '🏹' },
  // ── 초록색: 간호사 / 공동묘지 / 소총 ──
  { id: 'p-nurse',    name: '간호사',   category: 'PERSON',   attribute: '여성',   color: '초록색', emoji: '💉' },
  { id: 'l-cemetery', name: '공동묘지', category: 'LOCATION', attribute: '야외',   color: '초록색', emoji: '🪦' },
  { id: 'w-rifle',    name: '소총',     category: 'WEAPON',   attribute: '원거리', color: '초록색', emoji: '🎯' },
  // ── 노란색: 여배우 / 골목길 / 권총 ──
  { id: 'p-actress',  name: '여배우',   category: 'PERSON',   attribute: '여성',   color: '노란색', emoji: '🎭' },
  { id: 'l-alley',    name: '골목길',   category: 'LOCATION', attribute: '야외',   color: '노란색', emoji: '🏚️' },
  { id: 'w-pistol',   name: '권총',     category: 'WEAPON',   attribute: '원거리', color: '노란색', emoji: '🔫' },
  // ── 파란색: 의사 / 박물관 / 단검 ──
  { id: 'p-doctor',   name: '의사',     category: 'PERSON',   attribute: '남성',   color: '파란색', emoji: '🩺' },
  { id: 'l-museum',   name: '박물관',   category: 'LOCATION', attribute: '실내',   color: '파란색', emoji: '🏛️' },
  { id: 'w-dagger',   name: '단검',     category: 'WEAPON',   attribute: '근접',   color: '파란색', emoji: '🗡️' },
  // ── 주황색: 백작 / 도서관 / 도끼 ──
  { id: 'p-count',    name: '백작',     category: 'PERSON',   attribute: '남성',   color: '주황색', emoji: '🎩' },
  { id: 'l-library',  name: '도서관',   category: 'LOCATION', attribute: '실내',   color: '주황색', emoji: '📖' },
  { id: 'w-axe',      name: '도끼',     category: 'WEAPON',   attribute: '근접',   color: '주황색', emoji: '🪓' },
  // ── 흰색: 가정교사 / 무도회장 / 밧줄 ──
  { id: 'p-governess',name: '가정교사', category: 'PERSON',   attribute: '여성',   color: '흰색',   emoji: '📚' },
  { id: 'l-ballroom', name: '무도회장', category: 'LOCATION', attribute: '실내',   color: '흰색',   emoji: '💃' },
  { id: 'w-rope',     name: '밧줄',     category: 'WEAPON',   attribute: '근접',   color: '흰색',   emoji: '🪢' },
  // ── 갈색: 집사 / 온실 / 스패너 ──
  { id: 'p-butler',   name: '집사',     category: 'PERSON',   attribute: '남성',   color: '갈색',   emoji: '🤵' },
  { id: 'l-greenhouse',name:'온실',     category: 'LOCATION', attribute: '실내',   color: '갈색',   emoji: '🌿' },
  { id: 'w-wrench',   name: '스패너',   category: 'WEAPON',   attribute: '근접',   color: '갈색',   emoji: '🔧' },
  // ── 회색: 수녀 / 지하실 / 몽둥이 ──
  { id: 'p-nun',      name: '수녀',     category: 'PERSON',   attribute: '여성',   color: '회색',   emoji: '✝️' },
  { id: 'l-cellar',   name: '지하실',   category: 'LOCATION', attribute: '실내',   color: '회색',   emoji: '🕯️' },
  { id: 'w-club',     name: '몽둥이',   category: 'WEAPON',   attribute: '근접',   color: '회색',   emoji: '🏏' },
];

export const cardsByCategory = (category: Category): Card[] =>
  CARDS.filter((c) => c.category === category);

export const cardByColor = (color: CardColor, category: Category): Card | undefined =>
  CARDS.find((c) => c.color === color && c.category === category);

/** 카드 일러스트 경로 (public/cards/{id}.jpg). 없으면 CardView가 이모지로 대체 */
export const cardImage = (card: Card): string =>
  `${import.meta.env.BASE_URL}cards/${card.id}.jpg`;
