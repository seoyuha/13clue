// 13 Clues – Eco Detectives 게임 엔진 (서버 전용, 정답 정보는 서버만 보관)
const { COLORS, CARDS, TAGS, COLORS_FOR } = require('./cards.cjs');
const { QUESTIONS } = require('./questions.cjs');

const CARD = Object.fromEntries(CARDS.map((c) => [c.id, c]));
const QMAP = Object.fromEntries(QUESTIONS.map((q) => [q.id, q]));

const TIME = { ANSWER: 25 }; // 친구 대답 제한 시간(초)
const TOKEN_EVERY = 3;        // 미션 3개 맞힐 때마다 돋보기 토큰 +1
const STARS_PER_Q = Number(process.env.STARS_PER_Q || 2); // 질문 1번에 필요한 미션 정답 수
const RANK_BONUS = [100, 70, 50, 30, 20];
const BOTS = [
  { name: 'Drop', icon: '💧' },
  { name: 'Spark', icon: '⚡' },
  { name: 'Leafy', icon: '🌿' },
];

const shuffle = (arr) => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const now = () => Date.now();

// ───────────────────────── 카드 배분 (원래 13개의 증거 규칙) ─────────────────────────
function deal(playerCount) {
  const colorIds = COLORS.slice(0, COLORS_FOR[playerCount]).map((c) => c.id);
  const active = CARDS.filter((c) => colorIds.includes(c.color));
  const piles = ['PLACE', 'DO', 'DONT'].map((cat) => shuffle(active.filter((c) => c.cat === cat)));
  const hands = [];
  for (let i = 0; i < playerCount; i++) hands.push(piles.map((p) => p.shift()));
  let rest = shuffle(piles.flat());
  for (let i = 0; i < playerCount; i++) hands[i].push(...rest.splice(0, 2));
  // 각자 PLACE·DO·DON'T 1장씩 골라 왼쪽 친구 가림막 바깥으로 (자동)
  const given = hands.map((h) => ['PLACE', 'DO', 'DONT'].map((cat) => h.find((c) => c.cat === cat)));
  const inner = hands.map((h, i) => h.filter((c) => !given[i].includes(c)));
  const seats = [];
  for (let i = 0; i < playerCount; i++) {
    seats.push({
      outer: given[(i + 1) % playerCount].map((c) => c.id),
      inner: inner[i].map((c) => c.id),
    });
  }
  const secret = rest.map((c, i) => ({ letter: String.fromCharCode(65 + i), cardId: c.id }));
  return { colorIds, activeIds: active.map((c) => c.id), seats, secret };
}

// ───────────────────────── 게임 생성 ─────────────────────────
// players: [{pid, name}] (사람). solo면 사람 1명 + 봇 3명
function createGame({ id, mode, players, teamName }) {
  const humans = players.slice();
  let roster;
  if (mode === 'solo') {
    roster = [{ ...humans[0], bot: false }, ...BOTS.map((b, i) => ({ pid: `bot-${i}`, name: b.name, icon: b.icon, bot: true }))];
  } else {
    roster = humans.map((p) => ({ ...p, bot: false }));
  }
  const d = deal(roster.length);
  const seats = roster.map((p, i) => ({
    pid: p.pid,
    name: p.name,
    icon: p.icon || null,
    bot: p.bot,
    outer: d.seats[i].outer,
    inner: d.seats[i].inner,
    tokens: 1,
    peeked: {},
    mCorrect: 0,
    mTotal: 0,
    asked: 0,
    wrongGuesses: 0,
    penalty: 0,          // 팀: 쉬는 차례 수 / 혼자: 다시 해결하려면 맞혀야 할 미션 수
    solvedRank: null,
    solvedAt: null,
    score: 0,
    qQueue: shuffle(QUESTIONS.map((q) => q.id)),
    mission: null,       // { qid, shuffled, startedAt }
    phase: 'MISSION',    // MISSION | ASK | WAIT | SOLVED | BOT
    stars: 0,
    helped: 0,
    lastResult: null,
  }));
  const g = {
    id,
    mode,
    teamName: teamName || '',
    seats,
    colorIds: d.colorIds,
    activeIds: d.activeIds,
    secret: d.secret,
    log: [],
    startedAt: now(),
    finishedAt: null,
    solvedCount: 0,
    pending: [],        // 친구에게 보낸 질문 { id, from, to, q, at, wrongTries }
    missStats: {},      // qid -> {wrong, total}
    seq: 0,
  };
  seats.forEach((s, i) => { if (!s.bot) nextMission(g, i); else s.phase = 'BOT'; });
  return g;
}

// ───────────────────────── 미션 ─────────────────────────
function nextMission(g, si) {
  const s = g.seats[si];
  if (!s.qQueue.length) s.qQueue = shuffle(QUESTIONS.map((q) => q.id));
  const qid = s.qQueue.shift();
  const q = QMAP[qid];
  s.mission = {
    qid,
    options: q.type === 'choice' ? shuffle(q.options) : null,
    words: q.type === 'order' ? shuffle(q.words) : null,
    startedAt: now(),
  };
}

function publicMission(s) {
  if (!s.mission) return null;
  const q = QMAP[s.mission.qid];
  return {
    id: q.id,
    type: q.type,
    skill: q.skill,
    prompt: q.prompt,
    pic: q.pic || null,
    text: q.hideText ? null : q.text || null,
    say: q.say || q.text || null,
    hideText: !!q.hideText,
    bigOptions: !!q.bigOptions,
    options: s.mission.options,
    words: s.mission.words,
  };
}

function checkMission(q, answer) {
  if (q.type === 'choice') return answer === q.answer;
  return Array.isArray(answer) && answer.join('|') === q.words.join('|');
}

function correctText(q) {
  return q.type === 'choice' ? q.answer : q.words.join(' ');
}

function answerMission(g, si, answer) {
  const s = g.seats[si];
  if (!s.mission) return { error: '풀 문제가 없어요.' };
  if (g.finishedAt) return { error: '게임이 끝났어요.' };
  if (s.phase !== 'MISSION') return { error: '먼저 질문을 하세요.' };
  const q = QMAP[s.mission.qid];
  const ok = answer !== null && checkMission(q, answer);
  s.mTotal++;
  const st = (g.missStats[q.id] = g.missStats[q.id] || { wrong: 0, total: 0 });
  st.total++;
  let tokenGained = false;
  if (ok) {
    s.mCorrect++;
    s.score += 10;
    if (s.mCorrect % TOKEN_EVERY === 0) { s.tokens++; tokenGained = true; }
    if (s.penalty > 0) s.penalty--;
  } else {
    st.wrong++;
    s.qQueue.splice(Math.min(4, s.qQueue.length), 0, q.id); // 틀린 문제는 조금 뒤에 다시
  }
  s.lastResult = { ok, correct: correctText(q), tokenGained, at: now(), timeout: answer === null };
  s.mission = null;
  if (ok) s.stars = (s.stars || 0) + 1;
  if (ok && s.stars >= STARS_PER_Q && !s.solvedRank) { s.stars = 0; s.phase = 'ASK'; }
  else nextMission(g, si);
  return { ok };
}

// ───────────────────────── 질문 ─────────────────────────
// 질문 3가지 (친구는 내 가림막 바깥 = 나만 못 보는 카드를 보고 대답)
//  color: "How many green cards do I have?"  → "You have one."
//  tag:   "How many water cards do I have?"  → "You have two."
//  is:    "Is my DO card green?"             → "Yes, it is." / "No, it isn't."
const CAT_EN = { PLACE: 'PLACE', DO: 'DO', DONT: "DON'T" };
const CAT_IDX = { PLACE: 0, DO: 1, DONT: 2 };
function questionText(q) {
  if (q.kind === 'color') return `How many ${q.value} cards do I have?`;
  if (q.kind === 'is') return `Is my ${CAT_EN[q.cat]} card ${q.value}?`;
  return `How many ${TAGS[q.value].en} do I have?`;
}
const NUM = ['zero', 'one', 'two', 'three'];
function replyText(q, n) {
  if (q.kind === 'is') return n ? 'Yes, it is.' : "No, it isn't.";
  return `You have ${NUM[n] || n}.`;
}

function matches(cardId, q) {
  const c = CARD[cardId];
  if (q.kind === 'is') return c.cat === q.cat && c.color === q.value;
  return q.kind === 'color' ? c.color === q.value : c.tag === q.value;
}

function countOf(g, si, q) {
  return g.seats[si].outer.filter((id) => matches(id, q)).length;
}

function validQ(g, q) {
  if (!q) return false;
  if (q.kind === 'color') return g.colorIds.includes(q.value);
  if (q.kind === 'is') return g.colorIds.includes(q.value) && CAT_IDX[q.cat] !== undefined;
  if (q.kind === 'tag') return !!TAGS[q.value];
  return false;
}

function ask(g, si, to, q) {
  const s = g.seats[si];
  if (g.finishedAt) return { error: '게임이 끝났어요.' };
  if (to === si || !g.seats[to]) return { error: '질문할 친구를 고르세요.' };
  if (!validQ(g, q)) return { error: '질문을 고르세요.' };
  if (s.phase !== 'ASK') return { error: '먼저 미션을 해결하세요.' };
  s.asked++;
  const target = g.seats[to];
  if (target.bot || g.mode === 'solo') {
    finishAnswer(g, si, to, q, countOf(g, si, q), true);
    afterAsk(g, si);
  } else {
    g.pending.push({ id: ++g.seq, from: si, to, q, at: now(), wrongTries: 0 });
    s.phase = 'WAIT';
  }
  return { ok: true };
}

function afterAsk(g, si) {
  const s = g.seats[si];
  s.phase = 'MISSION';
  if (!s.solvedRank) nextMission(g, si);
}

function finishAnswer(g, from, to, q, n, auto) {
  g.log.push({ t: now(), type: 'ask', from, to, q, text: questionText(q), answer: n, reply: replyText(q, n), auto: !!auto });
}

function answerAsk(g, si, pid, n) {
  const p = g.pending.find((x) => x.id === Number(pid) && x.to === si);
  if (!p) return { error: '이미 답한 질문이에요.' };
  const real = countOf(g, p.from, p.q);
  if (Number(n) !== real) {
    p.wrongTries++;
    if (p.wrongTries < 2) return { ok: false, retry: true };
  }
  g.seats[si].helped = (g.seats[si].helped || 0) + (Number(n) === real ? 1 : 0);
  finishAnswer(g, p.from, si, p.q, real, Number(n) !== real);
  g.pending = g.pending.filter((x) => x !== p);
  afterAsk(g, p.from);
  return { ok: true };
}

// ───────────────────────── 비밀 카드 엿보기 ─────────────────────────
function peek(g, si, letter) {
  const s = g.seats[si];
  if (s.tokens < 1) return { error: '🔍 토큰이 없어요. 미션을 맞혀 토큰을 모으세요!' };
  const slot = g.secret.find((x) => x.letter === letter);
  if (!slot) return { error: '없는 카드예요.' };
  if (s.peeked[letter]) return { error: '이미 본 카드예요.' };
  s.tokens--;
  s.peeked[letter] = slot.cardId;
  return { ok: true, cardId: slot.cardId };
}

// ───────────────────────── 사건 해결 ─────────────────────────
function solve(g, si, guess) {
  const s = g.seats[si];
  if (g.finishedAt) return { error: '게임이 끝났어요.' };
  if (s.solvedRank) return { error: '이미 해결했어요.' };
  if (s.phase === 'WAIT') return { error: '친구의 대답을 기다린 뒤에 도전하세요.' };
  if (s.penalty > 0) return { error: `미션을 ${s.penalty}개 더 맞혀야 다시 도전할 수 있어요.` };
  const answer = s.outer; // [PLACE, DO, DONT]
  const ok = !!guess && guess.place === answer[0] && guess.do === answer[1] && guess.dont === answer[2];
  if (ok) {
    g.solvedCount++;
    s.solvedRank = g.solvedCount;
    s.solvedAt = now();
    s.score += g.mode === 'team' ? RANK_BONUS[s.solvedRank - 1] || 10 : 100;
    s.mission = null;
    s.phase = 'SOLVED';
    g.log.push({ t: now(), type: 'solve', from: si, rank: s.solvedRank });
    // 해결한 친구에게 온 질문은 계속 대답할 수 있음
  } else {
    s.wrongGuesses++;
    s.score = Math.max(0, s.score - 20);
    s.penalty = 2;
    g.log.push({ t: now(), type: 'wrong', from: si });
  }
  if (allHumansSolved(g)) g.finishedAt = now();
  return { ok };
}

function allHumansSolved(g) {
  return g.seats.filter((s) => !s.bot).every((s) => s.solvedRank);
}

// 대답 시간 초과 → 탐정 본부가 대신 대답. 상태가 바뀌면 true
function tick(g) {
  if (g.finishedAt || !g.pending.length) return false;
  const limit = now() - TIME.ANSWER * 1000;
  const late = g.pending.filter((p) => p.at < limit);
  if (!late.length) return false;
  late.forEach((p) => {
    finishAnswer(g, p.from, p.to, p.q, countOf(g, p.from, p.q), true);
    g.pending = g.pending.filter((x) => x !== p);
    afterAsk(g, p.from);
  });
  return true;
}

function endGame(g) {
  if (!g.finishedAt) g.finishedAt = now();
  g.pending = [];
}

// ───────────────────────── 화면용 데이터 ─────────────────────────
function seatPublic(g, s, i) {
  return {
    seat: i, name: s.name, icon: s.icon, bot: s.bot, tokens: s.tokens,
    mCorrect: s.mCorrect, mTotal: s.mTotal, asked: s.asked, helped: s.helped || 0,
    penalty: s.penalty, solvedRank: s.solvedRank, solvedAt: s.solvedAt,
    wrongGuesses: s.wrongGuesses, score: s.score, phase: s.phase, stars: s.stars,
  };
}

function viewFor(g, si) {
  const me = g.seats[si];
  const done = !!g.finishedAt;
  const seats = g.seats.map((s, i) => {
    const pub = seatPublic(g, s, i);
    // 다른 친구 가림막 바깥은 보임. 내 것은 해결했거나 게임이 끝났을 때만
    pub.outer = i !== si || me.solvedRank || done ? s.outer : null;
    return pub;
  });
  const incoming = g.pending.filter((p) => p.to === si)
    .map((p) => ({ id: p.id, from: p.from, text: questionText(p.q), q: p.q, wrongTries: p.wrongTries, at: p.at }));
  const outgoing = g.pending.find((p) => p.from === si);
  return {
    gameId: g.id, mode: g.mode, teamName: g.teamName, mySeat: si, seats,
    myInner: me.inner, myPeeked: me.peeked,
    secretLetters: g.secret.map((x) => x.letter),
    secretReveal: done ? g.secret : null,
    colorIds: g.colorIds, activeIds: g.activeIds,
    phase: done ? 'DONE' : me.phase,
    mission: !done && me.phase === 'MISSION' ? publicMission(me) : null,
    incoming,
    outgoing: outgoing ? { to: outgoing.to, text: questionText(outgoing.q), at: outgoing.at } : null,
    answerLimit: TIME.ANSWER,
    lastResult: me.lastResult,
    log: g.log.slice(-80),
    startedAt: g.startedAt, finishedAt: g.finishedAt,
    tokenEvery: TOKEN_EVERY, starsPerQ: STARS_PER_Q, now: now(),
  };
}

function teacherView(g) {
  return {
    gameId: g.id, mode: g.mode, teamName: g.teamName,
    seats: g.seats.map((s, i) => ({ ...seatPublic(g, s, i), outer: s.outer, pid: s.pid })),
    startedAt: g.startedAt, finishedAt: g.finishedAt, solvedCount: g.solvedCount,
    lastLog: g.log.slice(-4), pending: g.pending.length,
  };
}

module.exports = {
  createGame, answerMission, ask, answerAsk, peek, solve, tick, endGame,
  viewFor, teacherView, questionText, countOf, QMAP, CARD, TIME,
};
