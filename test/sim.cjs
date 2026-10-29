// 엔진 시뮬레이션 (새 규칙): 미션 정답률 p, 무작위 질문, 정확한 추리
const E = require('../game/engine.cjs');
const CARD = E.CARD;
let RANDQ = 0.5;
const TAGQ = ['inside', 'outside', 'water', 'energy', 'earth'];
const matchQ = (id, q) => (q.kind === 'is' ? CARD[id].cat === q.cat && CARD[id].color === q.value : q.kind === 'color' ? CARD[id].color === q.value : CARD[id].tag === q.value);

function combosFor(g, si) {
  const v = E.viewFor(g, si);
  const seen = new Set(v.myInner);
  v.seats.forEach((s, i) => { if (i !== si && s.outer) s.outer.forEach((x) => seen.add(x)); });
  Object.values(v.myPeeked).forEach((x) => seen.add(x));
  const cand = v.activeIds.filter((id) => !seen.has(id));
  const by = (c) => cand.filter((id) => CARD[id].cat === c);
  const out = [];
  for (const a of by('PLACE')) for (const b of by('DO')) for (const c of by('DONT')) {
    if (v.log.every((e) => e.type !== 'ask' || e.from !== si || [a, b, c].filter((id) => matchQ(id, e.q)).length === e.answer)) out.push([a, b, c]);
  }
  return out;
}
function smartQ(g, si, combos) {
  // 아이들처럼 반쯤은 무작위, 반쯤은 좋은 질문
  const qs = [...g.colorIds.map((c) => ({ kind: 'color', value: c })), ...TAGQ.map((t) => ({ kind: 'tag', value: t })), ...g.colorIds.flatMap((c) => ['PLACE','DO','DONT'].map((cat) => ({ kind: 'is', cat, value: c })))];
  if (Math.random() < RANDQ) return qs[Math.floor(Math.random() * qs.length)];
  let best = qs[0], bs = 1e9;
  for (const q of qs) {
    const cnt = {}; combos.forEach((cb) => { const k = cb.filter((id) => matchQ(id, q)).length; cnt[k] = (cnt[k] || 0) + 1; });
    const sc = Math.max(...Object.values(cnt)); if (sc < bs) { bs = sc; best = q; }
  }
  return best;
}
function mission(g, si, p) {
  const v = E.viewFor(g, si); const q = E.QMAP[v.mission.id]; const right = Math.random() < p;
  const ans = q.type === 'choice' ? (right ? q.answer : v.mission.options.find((o) => o !== q.answer)) : (right ? q.words : [...q.words].reverse());
  return E.answerMission(g, si, ans);
}
function play(n, p, solo) {
  const players = Array.from({ length: solo ? 1 : n }, (_, i) => ({ pid: 'p' + i, name: 'S' + i }));
  const g = E.createGame({ id: 'x', mode: solo ? 'solo' : 'team', players });
  const humans = g.seats.map((s, i) => i).filter((i) => !g.seats[i].bot);
  let ticks = 0;
  while (!g.finishedAt && ticks < 5000) {
    ticks++;
    for (const si of humans) {
      const s = g.seats[si];
      g.pending.filter((x) => x.to === si).forEach((x) => E.answerAsk(g, si, x.id, E.countOf(g, x.from, x.q)));
      if (s.solvedRank) continue;
      if (s.phase === 'WAIT') continue;
      const combos = combosFor(g, si);
      if (combos.length <= 2 && s.penalty === 0 && s.phase !== 'WAIT') { const [a, b, c] = combos[Math.floor(Math.random()*combos.length)]; E.solve(g, si, { place: a, do: b, dont: c }); continue; }
      if (s.phase === 'MISSION') mission(g, si, p);
      else if (s.phase === 'ASK') {
        if (s.tokens > 0) { const v = E.viewFor(g, si); const L = v.secretLetters.find((l) => !v.myPeeked[l]); if (L) E.peek(g, si, L); }
        const others = g.seats.map((x, i) => i).filter((i) => i !== si);
        const r = E.ask(g, si, others[Math.floor(Math.random() * others.length)], smartQ(g, si, combos));
        if (r.error) throw Error(r.error);
      }
    }
  }
  return g.seats.filter((s) => !s.bot).map((s) => ({ m: s.mTotal, a: s.asked, ok: !!s.solvedRank, w: s.wrongGuesses }));
}
for (const rq of [0.5, 1]) { RANDQ = rq; console.log('RANDQ', rq);
for (const [label, n, solo] of [['SOLO', 4, true], ['TEAM3', 3, false], ['TEAM4', 4, false], ['TEAM2', 2, false], ['TEAM5', 5, false]]) {
  const rs = Array.from({ length: 300 }, () => play(n, 0.75, solo)).flat();
  const avg = (k) => (rs.reduce((x, y) => x + y[k], 0) / rs.length).toFixed(1);
  const ms = rs.map((r) => r.m).sort((a, b) => a - b);
  console.log(label, 'missions avg', avg('m'), 'median', ms[ms.length >> 1], 'p10', ms[Math.floor(ms.length * 0.1)], 'p90', ms[Math.floor(ms.length * 0.9)], 'questions', avg('a'), 'allSolved', rs.every((r) => r.ok), 'wrongG', avg('w'));
}
}
// debug
RANDQ = 0.5;
for (let k = 0; k < 400; k++) {
  const r = play(4, 0.75, false);
  if (!r.every((x) => x.ok)) { console.log('UNSOLVED', JSON.stringify(r)); break; }
}
