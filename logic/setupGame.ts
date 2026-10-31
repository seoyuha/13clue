import type { Card, PlayerState, RoomState, SecretCardSlot } from '../types';
import { CARDS, REMOVED_COLORS } from '../data/cards';
import { createRng, shuffle } from './rng';

export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 6;
export const STARTING_TOKENS = 1;

/**
 * 인원수별 비밀정보원 카드 장수.
 * 사용 카드 수 - (인원 × 5)
 */
export const SECRET_SIZE: Record<number, number> = { 2: 8, 3: 6, 4: 4, 5: 2, 6: 0 };

// ───────────────────────── 룸 코드 ─────────────────────────
// 4~6자리 숫자. 첫 자리 = 인원수(2~6)
// 기본 생성: 6자리 (인원수 1자리 + 5자리 난수 = 총 10만 개 조합으로 전국 단위 중복 0% 보장)

export function generateRoomCode(playerCount: number): string {
  if (playerCount < MIN_PLAYERS || playerCount > MAX_PLAYERS) {
    throw new Error(`인원수는 ${MIN_PLAYERS}~${MAX_PLAYERS}명이어야 합니다.`);
  }
  const rest = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  return `${playerCount}${rest}`;
}

export function parseRoomCode(code: string): number | null {
  // 6자리 기본 및 4~6자리 유연 호환
  if (!/^[2-6]\d{3,5}$/.test(code)) return null;
  return Number(code[0]);
}

// ───────────────────────── 카드 배분 ─────────────────────────

const take = <T,>(pile: T[], n: number): T[] => pile.splice(0, n);

/**
 * 공식 룰북 기반 카드 배분 알고리즘 (자동 분배 모드)
 *
 * 1. 인원수에 따라 지정 색깔 카드를 제외
 * 2. 인물/장소/흉기 더미 각각에서 1장씩 뽑기 (총 3장) → 각 플레이어에게
 * 3. 남은 카드를 섞어 각자 2장 추가 (총 5장)
 * 4. 각 플레이어의 5장에서 [인물1, 장소1, 흉기1] 자동 선택 → 왼쪽 이웃 가림막으로
 * 5. 나머지 2장 → 손패 ([0]=왼쪽 카드, [1]=오른쪽 카드)
 * 6. 남은 카드 → 중앙 비밀정보원 카드 (알파벳 타일 A, B, C...)
 *
 * 같은 룸 코드 → 모든 태블릿에서 항상 동일한 결과
 */
export function setupGame(roomId: string, playerNames: string[] = []): RoomState {
  const playerCount = parseRoomCode(roomId);
  if (playerCount === null) throw new Error(`잘못된 룸 코드입니다: ${roomId}`);

  const rng = createRng(`13clues-v2:${roomId}`);

  // 1. 색깔에 따라 카드 제외
  const removedColors = REMOVED_COLORS[playerCount] || [];
  const removedCards = CARDS.filter((c) => removedColors.includes(c.color));
  const activeCards = CARDS.filter((c) => !removedColors.includes(c.color));

  // 2. 인물/장소/흉기 더미 분리 및 셔플
  const persons = shuffle(activeCards.filter((c) => c.category === 'PERSON'), rng);
  const locations = shuffle(activeCards.filter((c) => c.category === 'LOCATION'), rng);
  const weapons = shuffle(activeCards.filter((c) => c.category === 'WEAPON'), rng);

  // 3. 각 플레이어에게 더미마다 1장씩 (총 3장)
  const hands: Card[][] = [];
  for (let i = 0; i < playerCount; i++) {
    hands.push([...take(persons, 1), ...take(locations, 1), ...take(weapons, 1)]);
  }

  // 4. 남은 카드 합쳐서 셔플 → 각자 2장 추가 (총 5장)
  const remaining = shuffle([...persons, ...locations, ...weapons], rng);
  for (let i = 0; i < playerCount; i++) {
    hands[i].push(...take(remaining, 2));
  }

  // 5. 비밀정보원 카드 (알파벳 타일 매핑)
  const secretCards: SecretCardSlot[] = remaining.map((card, idx) => ({
    letter: String.fromCharCode(65 + idx), // A, B, C, D...
    card,
  }));

  // 6. 자동 분배: 각 플레이어의 5장에서 인물1·장소1·흉기1 선택 → 왼쪽 이웃 가림막
  const givenSets: Card[][] = [];  // givenSets[i] = player i가 고른 3장
  const innerSets: Card[][] = [];  // innerSets[i] = player i의 남은 2장 ([0]=왼쪽 카드, [1]=오른쪽 카드)

  for (let i = 0; i < playerCount; i++) {
    const hand = hands[i];
    const person = hand.find((c) => c.category === 'PERSON')!;
    const location = hand.find((c) => c.category === 'LOCATION')!;
    const weapon = hand.find((c) => c.category === 'WEAPON')!;
    givenSets.push([person, location, weapon]);
    innerSets.push(hand.filter((c) => c !== person && c !== location && c !== weapon));
  }

  // 7. PlayerState 조립
  // player i가 고른 카드 → 왼쪽 이웃 (i-1+n)%n 의 가림막 바깥
  // 따라서 player i의 outerCards = givenSets[(i+1) % n] (오른쪽 이웃이 넘긴 것)
  const players: PlayerState[] = [];
  for (let i = 0; i < playerCount; i++) {
    const rightNeighbor = (i + 1) % playerCount;
    players.push({
      id: `seat-${i + 1}`,
      name: playerNames[i]?.trim() || `${i + 1}번 탐정`,
      outerCards: givenSets[rightNeighbor],
      innerCards: innerSets[i],
      givenCards: givenSets[i],
      tokens: STARTING_TOKENS,
    });
  }

  // 검증
  if (secretCards.length !== SECRET_SIZE[playerCount]) {
    throw new Error(
      `배분 오류: 비밀정보원 ${secretCards.length}장 (기대값 ${SECRET_SIZE[playerCount]}장)`,
    );
  }

  return {
    roomId,
    status: 'PLAYING',
    playerCount,
    players,
    secretCards,
    removedColors,
    removedCards,
  };
}
