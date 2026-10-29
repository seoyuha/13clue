export type Category = 'PERSON' | 'LOCATION' | 'WEAPON';

export type Attribute = '남성' | '여성' | '실내' | '야외' | '근접' | '원거리';

export type CardColor =
  | '보라색' | '분홍색' | '빨간색' | '초록색' | '노란색'
  | '파란색' | '주황색' | '흰색' | '갈색' | '회색';

export interface Card {
  id: string;
  name: string;
  category: Category;
  attribute: Attribute;
  color: CardColor;
  emoji: string;
}

export interface PlayerState {
  id: string;
  name: string;
  outerCards: Card[];   // 가림막 바깥 3장 (남에게 보이는 사건 카드: 인물1, 장소1, 흉기1)
  innerCards: Card[];   // 가림막 안쪽 2장 (나만 보는 손패: [0]=왼쪽 카드, [1]=오른쪽 카드)
  givenCards: Card[];   // 내가 왼쪽 플레이어에게 넘긴 3장 (정답 제외 힌트)
  tokens: number;       // 돋보기 토큰 (2인 모드에서는 미표시)
}

export interface SecretCardSlot {
  letter: string;       // 알파벳 타일 (A, B, C...)
  card: Card;
}

export interface RoomState {
  roomId: string;
  status: 'LOBBY' | 'PLAYING';
  playerCount: number;
  players: PlayerState[];
  secretCards: SecretCardSlot[]; // 알파벳 타일 매핑 중앙 비밀정보원
  removedColors: CardColor[];    // 인원수별 제외된 색깔 목록
  removedCards: Card[];         // 제외된 카드 전체 목록
}

/** 메모 시트 칸 상태: 빈칸 → X → O → 빈칸 */
export type MarkState = '' | 'X' | 'O';

/** localStorage에 저장되는 내 진행 상황 */
export interface SavedSession {
  roomId: string;
  seat: number; // 0-based
  name: string;
  tokens: number;
  marks: Record<string, MarkState>;
  viewedSecrets?: Record<string, string>; // letter -> cardId (e.g. { 'A': 'w-rifle' })
  playerNames?: Record<number, string>;   // seat -> player custom name (실시간 이름 동기화)
}

