// 13 Clues – Eco Detectives : 12단원(We Should Save the World) 카드 27장
// 색깔당 PLACE 1 · DO 1 · DON'T 1 = 3장, 9색

const COLORS = [
  { id: 'red',    en: 'red',    ko: '빨강', hex: '#ef4444' },
  { id: 'orange', en: 'orange', ko: '주황', hex: '#f97316' },
  { id: 'yellow', en: 'yellow', ko: '노랑', hex: '#eab308' },
  { id: 'green',  en: 'green',  ko: '초록', hex: '#22c55e' },
  { id: 'blue',   en: 'blue',   ko: '파랑', hex: '#3b82f6' },
  { id: 'purple', en: 'purple', ko: '보라', hex: '#a855f7' },
  { id: 'pink',   en: 'pink',   ko: '분홍', hex: '#ec4899' },
  { id: 'white',  en: 'white',  ko: '흰색', hex: '#cbd5e1' },
  { id: 'brown',  en: 'brown',  ko: '갈색', hex: '#a16207' },
];

const CATEGORIES = {
  PLACE: { en: 'PLACE', ko: '장소', icon: '📍' },
  DO:    { en: 'DO',    ko: '해야 할 일', icon: '✅' },
  DONT:  { en: "DON'T", ko: '하지 말아야 할 일', icon: '🚫' },
};

const TAGS = {
  inside:  { en: 'inside places',  ko: '실내 장소', icon: '🏠' },
  outside: { en: 'outside places', ko: '야외 장소', icon: '🌳' },
  water:   { en: 'water cards',    ko: '물(water) 카드', icon: '💧' },
  energy:  { en: 'energy cards',   ko: '에너지(energy) 카드', icon: '⚡' },
  earth:   { en: 'Earth cards',    ko: '지구(Earth) 카드', icon: '🌏' },
};

// prep: 리포트용 장소 표현
const CARDS = [
  // red
  { id: 'p-kitchen',   cat: 'PLACE', color: 'red',    tag: 'inside',  en: 'kitchen',    ko: '부엌',     emoji: '🍳', prep: 'in the kitchen' },
  { id: 'd-water',     cat: 'DO',    color: 'red',    tag: 'water',   en: 'turn off the water', ko: '물 잠그기', emoji: '🚰' },
  { id: 'n-elevator',  cat: 'DONT',  color: 'red',    tag: 'energy',  en: 'use the elevator', ko: '엘리베이터 타기', emoji: '🛗' },
  // orange
  { id: 'p-park',      cat: 'PLACE', color: 'orange', tag: 'outside', en: 'park',       ko: '공원',     emoji: '🌳', prep: 'at the park' },
  { id: 'd-light',     cat: 'DO',    color: 'orange', tag: 'energy',  en: 'turn off the light', ko: '불 끄기', emoji: '💡' },
  { id: 'n-papercup',  cat: 'DONT',  color: 'orange', tag: 'earth',   en: 'use paper cups', ko: '종이컵 쓰기', emoji: '🥤' },
  // yellow
  { id: 'p-bathroom',  cat: 'PLACE', color: 'yellow', tag: 'inside',  en: 'bathroom',   ko: '욕실',     emoji: '🛁', prep: 'in the bathroom' },
  { id: 'd-stairs',    cat: 'DO',    color: 'yellow', tag: 'energy',  en: 'use the stairs', ko: '계단 이용하기', emoji: '🪜' },
  { id: 'n-wastewater',cat: 'DONT',  color: 'yellow', tag: 'water',   en: 'waste water', ko: '물 낭비하기', emoji: '💦' },
  // green
  { id: 'p-beach',     cat: 'PLACE', color: 'green',  tag: 'outside', en: 'beach',      ko: '해변',     emoji: '🏖️', prep: 'at the beach' },
  { id: 'd-cup',       cat: 'DO',    color: 'green',  tag: 'water',   en: 'use a cup',  ko: '컵 사용하기', emoji: '🪥' },
  { id: 'n-plastic',   cat: 'DONT',  color: 'green',  tag: 'earth',   en: 'use plastic bags', ko: '비닐봉지 쓰기', emoji: '🛍️' },
  // blue
  { id: 'p-classroom', cat: 'PLACE', color: 'blue',   tag: 'inside',  en: 'classroom',  ko: '교실',     emoji: '🏫', prep: 'in the classroom' },
  { id: 'd-recycle',   cat: 'DO',    color: 'blue',   tag: 'earth',   en: 'recycle cans and bottles', ko: '캔과 병 재활용하기', emoji: '♻️' },
  { id: 'n-car',       cat: 'DONT',  color: 'blue',   tag: 'energy',  en: 'drive a car', ko: '자동차 타기', emoji: '🚗' },
  // purple
  { id: 'p-playground',cat: 'PLACE', color: 'purple', tag: 'outside', en: 'playground', ko: '놀이터',   emoji: '🛝', prep: 'on the playground' },
  { id: 'd-reuse',     cat: 'DO',    color: 'purple', tag: 'earth',   en: 'reuse paper', ko: '종이 재사용하기', emoji: '📄' },
  { id: 'n-food',      cat: 'DONT',  color: 'purple', tag: 'earth',   en: 'waste food', ko: '음식 남기기', emoji: '🍱' },
  // pink
  { id: 'p-bedroom',   cat: 'PLACE', color: 'pink',   tag: 'inside',  en: 'bedroom',    ko: '침실',     emoji: '🛏️', prep: 'in the bedroom' },
  { id: 'd-wash',      cat: 'DO',    color: 'pink',   tag: 'water',   en: 'wash quickly', ko: '빨리 씻기', emoji: '🧼' },
  { id: 'n-paper',     cat: 'DONT',  color: 'pink',   tag: 'earth',   en: 'throw away paper', ko: '종이 버리기', emoji: '🗑️' },
  // white
  { id: 'p-mountain',  cat: 'PLACE', color: 'white',  tag: 'outside', en: 'mountain',   ko: '산',       emoji: '⛰️', prep: 'on the mountain' },
  { id: 'd-bike',      cat: 'DO',    color: 'white',  tag: 'energy',  en: 'ride a bike', ko: '자전거 타기', emoji: '🚲' },
  { id: 'n-cans',      cat: 'DONT',  color: 'white',  tag: 'earth',   en: 'throw away cans and bottles', ko: '캔과 병 버리기', emoji: '🥫' },
  // brown
  { id: 'p-library',   cat: 'PLACE', color: 'brown',  tag: 'inside',  en: 'library',    ko: '도서관',   emoji: '📚', prep: 'in the library' },
  { id: 'd-tv',        cat: 'DO',    color: 'brown',  tag: 'energy',  en: 'turn off the TV', ko: 'TV 끄기', emoji: '📺' },
  { id: 'n-lighton',   cat: 'DONT',  color: 'brown',  tag: 'energy',  en: 'leave the light on', ko: '불 켜 두기', emoji: '🔆' },
];

// 인원수별 사용 색깔 수 (원래 13개의 증거와 동일한 비율)
const COLORS_FOR = { 2: 6, 3: 7, 4: 8, 5: 9 };

module.exports = { COLORS, CATEGORIES, TAGS, CARDS, COLORS_FOR };
