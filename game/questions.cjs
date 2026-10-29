// 12단원 Eco Mission 문제은행 (지도서 Words·Song·Talk Talk·Read and Write·Go Green·Earth News·Review 기반)
// type: 'choice' | 'order'
// skill: 낱말 | 표현 | 듣기 | 읽기 | 문장
// pic: 큰 그림(이모지), say: 듣기용 문장(TTS), hideText: 듣기 문제는 글자 숨김

const Q = [];
let n = 0;
const add = (o) => Q.push({ id: `q${++n}`, ...o });

// ── 1. 낱말: 그림 보고 표현 고르기 (Words) ──
const WORDS = [
  ['♻️🥫🍾', 'recycle cans and bottles'],
  ['📄✏️', 'reuse paper'],
  ['💡👆', 'turn off the light'],
  ['🚰✋', 'turn off the water'],
  ['🪥🥛', 'use a cup'],
  ['🧍🪜', 'use the stairs'],
];
const ALL_PHRASES = WORDS.map((w) => w[1]);
WORDS.forEach(([pic, ans]) => {
  const opts = [ans, ...ALL_PHRASES.filter((p) => p !== ans).sort(() => 0.5 - Math.random()).slice(0, 3)];
  add({ type: 'choice', skill: '낱말', prompt: '그림에 알맞은 표현을 고르세요.', pic, options: opts, answer: ans });
});

// ── 2. 낱말: 뜻 고르기 ──
[
  ['reuse paper', '종이를 재사용하다'],
  ['use the stairs', '계단을 이용하다'],
  ['turn off the water', '물을 잠그다'],
  ['recycle cans and bottles', '캔과 병을 재활용하다'],
  ['plastic bag', '비닐봉지'],
  ['forest', '숲'],
  ['energy', '에너지'],
  ['quickly', '빨리'],
].forEach(([en, ko], i, arr) => {
  const others = arr.filter((x) => x[1] !== ko).map((x) => x[1]).sort(() => 0.5 - Math.random()).slice(0, 3);
  add({ type: 'choice', skill: '낱말', prompt: '알맞은 뜻을 고르세요.', text: en, say: en, options: [ko, ...others], answer: ko });
});

// ── 3. 표현: 빈칸 (Read and Write / Read and Check) ──
[
  ["Don't ____ to turn off the light.", 'forget', ['forget', 'should', 'use', 'save']],
  ["We ____ save energy.", 'should', ['should', 'forget', 'turn', "don't"]],
  ["Don't forget to ____ the stairs.", 'use', ['use', 'save', 'turn', 'wash']],
  ["Don't forget to ____ off the water.", 'turn', ['turn', 'use', 'reuse', 'save']],
  ["Don't forget to use the ____ .", 'stairs', ['stairs', 'water', 'light', 'paper']],
  ["Don't forget to ____ paper.", 'reuse', ['reuse', 'turn off', 'ride', 'wash']],
  ["Don't ____ plastic bags.", 'use', ['use', 'forget', 'save', 'should']],
  ["Don't forget to turn off the water and wash ____ .", 'quickly', ['quickly', 'paper', 'energy', 'forest']],
  ["We should save the ____ . The Earth is our home.", 'world', ['world', 'plastic bag', 'cup', 'stairs']],
  ["Don't forget to ____ cans and bottles.", 'recycle', ['recycle', 'turn off', 'use', 'wash']],
].forEach(([text, ans, opts]) => add({ type: 'choice', skill: '표현', prompt: '빈칸에 알맞은 말을 고르세요.', text, options: opts, answer: ans }));

// ── 4. 표현: 행동 → 아끼는 것 (Read and Speak) ──
[
  ['💡', "Don't forget to turn off the light.", 'energy'],
  ['🪜', "Don't forget to use the stairs.", 'energy'],
  ['🪥', "Don't forget to use a cup.", 'water'],
  ['🚰', "Don't forget to turn off the water.", 'water'],
  ['📄', "Don't forget to reuse paper.", 'the forest'],
].forEach(([pic, text, ans]) =>
  add({ type: 'choice', skill: '표현', prompt: '이어질 말로 알맞은 것은? "We should save ____."', pic, text, options: ['water', 'energy', 'the forest', 'plastic bags'], answer: ans }));

// ── 5. 듣기 (Song / Listen and Say) ──
[
  ["Don't forget to turn off the light.", '💡', ['💡', '🚰', '🪜', '♻️']],
  ["Don't forget to use the stairs.", '🪜', ['🪜', '🛗', '💡', '📄']],
  ["Don't forget to use a cup.", '🪥', ['🪥', '🚰', '🛍️', '🚲']],
  ["Don't forget to recycle cans and bottles.", '♻️', ['♻️', '📄', '💡', '🧼']],
  ["Don't forget to reuse paper.", '📄', ['📄', '🗑️', '🥤', '🚰']],
  ["Don't use plastic bags.", '🛍️', ['🛍️', '🥤', '🥫', '🚗']],
].forEach(([say, ans, opts]) =>
  add({ type: 'choice', skill: '듣기', prompt: '🔊 잘 듣고 알맞은 그림을 고르세요.', say, hideText: true, options: opts, answer: ans, bigOptions: true }));
[
  ['We should save water.', 'We should save water.'],
  ['We should save energy.', 'We should save energy.'],
].forEach(([say, ans]) =>
  add({ type: 'choice', skill: '듣기', prompt: '🔊 잘 듣고 들은 문장을 고르세요.', say, hideText: true, options: ['We should save water.', 'We should save energy.', 'We should save the forest.', 'We should use plastic bags.'], answer: ans }));

// ── 6. 읽기: Go Green T/F ──
[
  ['We should use plastic bags.', 'F'],
  ['We should save the forest.', 'T'],
  ['The Earth is our home. We should save the Earth.', 'T'],
  ["Don't use paper cups.", 'T'],
  ['Let\'s wash quickly.', 'T'],
  ['We should throw away cans and bottles.', 'F'],
].forEach(([text, tf]) =>
  add({ type: 'choice', skill: '읽기', prompt: '🌲 Go Green 캠페인! 지구를 지키는 말이면 True, 아니면 False', text, say: text, options: ['True ⭕', 'False ❌'], answer: tf === 'T' ? 'True ⭕' : 'False ❌' }));

// ── 7. 읽기: Earth News – 해야 할 일 / 하지 말아야 할 일 ──
[
  ["Don't throw away cans and bottles.", '하지 말아야 할 일 👎'],
  ['Use the stairs.', '해야 할 일 👍'],
  ["Don't forget to reuse paper.", '해야 할 일 👍'],
  ["Don't use plastic bags.", '하지 말아야 할 일 👎'],
].forEach(([text, ans]) =>
  add({ type: 'choice', skill: '읽기', prompt: '📰 Earth News: 해야 할 일일까요, 하지 말아야 할 일일까요?', text, say: text, options: ['해야 할 일 👍', '하지 말아야 할 일 👎'], answer: ans }));

// ── 8. 대화 응답 (Read and Speak / Review B) ──
[
  ["Don't forget to reuse paper.", 'Okay. We should save the world.'],
  ["Don't forget to use a cup.", 'Okay. We should save water.'],
  ["Don't forget to turn off the light.", 'Okay. We should save energy.'],
].forEach(([text, ans]) =>
  add({ type: 'choice', skill: '표현', prompt: '💬 친구의 말에 알맞은 대답을 고르세요.', text, say: text, options: [ans, 'Yes, I can.', "It's on the desk.", 'I like apples.'], answer: ans }));

// ── 9. 문장 배열 (Fun Time / Write and Share) ──
[
  ["Don't", 'forget', 'to', 'turn off', 'the light.'],
  ["Don't", 'forget', 'to', 'reuse', 'paper.'],
  ['We', 'should', 'save', 'the world.'],
  ['We', 'should', 'save', 'water.'],
  ["Don't", 'use', 'plastic bags.'],
  ["Don't", 'forget', 'to', 'use', 'the stairs.'],
  ['How about', 'using', 'the stairs?'],
  ['The Earth', 'is', 'our', 'home.'],
].forEach((words) => add({ type: 'order', skill: '문장', prompt: '🧩 낱말을 순서대로 눌러 문장을 완성하세요.', words, say: words.join(' ') }));

module.exports = { QUESTIONS: Q };
