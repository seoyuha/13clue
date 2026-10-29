const { chromium } = require('playwright');
const WebSocket = require('ws');
const { QUESTIONS } = require('../game/questions.cjs');
const { CARDS } = require('../game/cards.cjs');
const Q = Object.fromEntries(QUESTIONS.map((q) => [q.id, q]));
const C = Object.fromEntries(CARDS.map((c) => [c.id, c]));
const BASE = 'http://localhost:10600';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const shot = (p, n) => p.screenshot({ path: `${__dirname}/shots/${n}.png` });
globalThis.match = (id, q) => q.kind === 'is' ? C[id].cat === q.cat && C[id].color === q.value : q.kind === 'color' ? C[id].color === q.value : C[id].tag === q.value;

function bot(code, name, opts = {}) {
  const ws = new WebSocket(BASE.replace('http', 'ws'));
  const pid = 'bot' + Math.random().toString(36).slice(2, 7);
  let busy = false, v = null;
  ws.on('open', () => ws.send(JSON.stringify({ t: 'join', code, name, pid })));
  ws.on('message', async (raw) => {
    const m = JSON.parse(raw);
    if (m.t !== 'state') return;
    v = m.view;
    if (busy || v.phase === 'DONE') return;
    busy = true;
    await sleep(opts.delay ?? 700);
    try {
      if (v.incoming.length) {
        const inc = v.incoming[0];
        const n = v.seats[inc.from].outer.filter((id) => match(id, inc.q)).length;
        ws.send(JSON.stringify({ t: 'answer', id: inc.id, n }));
      } else if (v.phase === 'MISSION' && v.mission) {
        const q = Q[v.mission.id];
        const right = Math.random() < 0.85;
        const ans = q.type === 'choice' ? (right ? q.answer : v.mission.options.find((o) => o !== q.answer)) : (right ? q.words : [...q.words].reverse());
        ws.send(JSON.stringify({ t: 'mission', answer: ans }));
      } else if (v.phase === 'ASK') {
        const others = v.seats.filter((s) => s.seat !== v.mySeat);
        const to = opts.target !== undefined && Math.random() < 0.7 ? others.find((s) => s.name === opts.target)?.seat ?? others[0].seat : others[Math.floor(Math.random() * others.length)].seat;
        const kinds = [{ kind: 'color', value: v.colorIds[Math.floor(Math.random() * v.colorIds.length)] }, { kind: 'tag', value: 'water' }, { kind: 'is', cat: 'DO', value: v.colorIds[0] }];
        ws.send(JSON.stringify({ t: 'ask', to, q: kinds[Math.floor(Math.random() * 3)] }));
      }
    } finally { busy = false; }
  });
  return { ws, get v() { return v; } };
}

(async () => {
  const browser = await chromium.launch();
  const tctx = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  const teacher = await tctx.newPage();
  const errs = [];
  teacher.on('pageerror', (e) => errs.push('teacher: ' + e.message));
  await teacher.goto(BASE + '/teacher');
  await teacher.waitForSelector('.code');
  const code = (await teacher.textContent('.code')).trim();
  console.log('code', code);

  // 학생 A (태블릿)
  const sctx = await browser.newContext({ viewport: { width: 1180, height: 820 }, deviceScaleFactor: 1 });
  const stu = await sctx.newPage();
  stu.on('pageerror', (e) => errs.push('student: ' + e.message));
  await stu.goto(BASE + '/');
  await stu.waitForSelector('#in-name');
  await shot(stu, '01-entry');
  await stu.fill('#in-name', '김하늘');
  await stu.fill('#in-code', code);
  await stu.click('#go-join');
  await stu.waitForSelector('.lobby');

  const bots = [bot(code, '이준', { target: '김하늘', delay: 900 }), bot(code, '박서연', { target: '김하늘', delay: 1100 }), bot(code, '최도윤', { delay: 800 })];
  await sleep(800);
  await shot(teacher, '02-teacher-lobby');
  await teacher.click('[data-mode="team"]');
  await teacher.click('[data-size="4"]');
  await teacher.click('#assign');
  await sleep(700);
  await shot(teacher, '03-teacher-assigned');
  await shot(stu, '04-student-lobby');
  await teacher.click('#start');
  await stu.waitForSelector('.mission, .incoming', { timeout: 5000 });
  await sleep(500);
  await shot(stu, '05-student-mission');

  // 학생 A 자동 플레이 (UI 클릭) — 일부 장면 캡처
  const got = {};
  const tap = (sel) => stu.click(sel, { timeout: 2500 }).then(() => true, () => false);
  for (let step = 0; step < 220; step++) {
    await sleep(350);
    const st = await stu.evaluate(() => ({ phase: V.phase, mission: V.mission, inc: V.incoming.length, solved: !!V.seats[V.mySeat].solvedRank, me: V.seats[V.mySeat], log: V.log.filter((e) => e.type === 'ask' && e.from === V.mySeat).length }));
    if (st.phase === 'DONE' || st.solved) { await sleep(1500); await shot(stu, '12-student-solved'); break; }
    if (await stu.$('.flash')) continue;
    if (st.inc) {
      if (!got.inc) { got.inc = 1; await shot(stu, '07-incoming-question'); }
      const inc = await stu.evaluate(() => V.incoming[0]);
      const outer = await stu.evaluate((f) => V.seats[f].outer, inc.from);
      const n = outer.filter((id) => match(id, inc.q)).length;
      await tap(`#incoming [data-n="${n}"]`);
      continue;
    }
    if (st.phase === 'MISSION' && st.mission) {
      const q = Q[st.mission.id];
      if (q.type === 'choice') {
        const idx = st.mission.options.indexOf(q.answer);
        await tap(`[data-opt="${idx}"]`);
      } else {
        if (!got.order) { got.order = 1; }
        for (const w of q.words) {
          const i = st.mission.words.indexOf(w);
          await tap(`[data-pick="${i}"]`);
        }
        if (got.order === 1) { got.order = 2; await shot(stu, '06-order-mission'); }
        await tap('#ord-ok');
      }
      continue;
    }
    if (st.phase === 'ASK') {
      // 내가 아는 정보로 남은 후보 계산
      const info = await stu.evaluate(() => {
        const seen = new Set(V.myInner);
        V.seats.forEach((x) => { if (x.seat !== V.mySeat && x.outer) x.outer.forEach((id) => seen.add(id)); });
        Object.values(V.myPeeked).forEach((id) => seen.add(id));
        return { seen: [...seen], active: V.activeIds, log: V.log.filter((e) => e.type === 'ask' && e.from === V.mySeat), tokens: V.seats[V.mySeat].tokens, letters: V.secretLetters, peeked: V.myPeeked };
      });
      if (info.tokens > 0) {
        const L = info.letters.find((l) => !info.peeked[l]);
        if (L) { await tap(`[data-peek="${L}"]`); await sleep(200); if (!got.peek) { got.peek = 1; await shot(stu, '08-peek-modal'); } await tap('#peek-ok'); await sleep(2600); continue; }
      }
      const cand = info.active.filter((id) => !info.seen.includes(id));
      const by = (c) => cand.filter((id) => C[id].cat === c);
      const combos = [];
      for (const a of by('PLACE')) for (const b of by('DO')) for (const c of by('DONT'))
        if (info.log.every((e) => [a, b, c].filter((id) => match(id, e.q)).length === e.answer)) combos.push([a, b, c]);
      if (combos.length === 1) {
        // 보고서 쓰기
        await tap('#open-report');
        const [a, b, c] = combos[0];
        await tap(`[data-pick-card="place|${a}"]`);
        await tap(`[data-pick-card="do|${b}"]`);
        await tap(`[data-pick-card="dont|${c}"]`);
        await shot(stu, '10-report-pick');
        await tap('#rep-next');
        const R = await stu.evaluate(() => ({ w1: ui.report.w1, w2: ui.report.w2, p1: ui.report.p1, p2: ui.report.p2 }));
        for (let i = 0; i < R.w1.length; i++) await tap(`[data-r-pick="s1|${i}"]`);
        for (let i = 0; i < R.w2.length; i++) await tap(`[data-r-pick="s2|${i}"]`);
        await shot(stu, '11-report-sentence');
        await tap('#rep-send');
        continue;
      }
      // 질문: 가장 많이 나누는 질문 고르기
      const colors = await stu.evaluate(() => V.colorIds);
      const qs = [...colors.map((c) => ({ kind: 'color', value: c })), ...['inside', 'outside', 'water', 'energy', 'earth'].map((t) => ({ kind: 'tag', value: t })), ...colors.flatMap((c) => ['PLACE', 'DO', 'DONT'].map((cat) => ({ kind: 'is', cat, value: c })))];
      let best = qs[0], bs = 1e9;
      for (const q of qs) { const cnt = {}; combos.forEach((cb) => { const k = cb.filter((id) => match(id, q)).length; cnt[k] = (cnt[k] || 0) + 1; }); const sc = Math.max(...Object.values(cnt)); if (sc < bs) { bs = sc; best = q; } }
      const target = await stu.evaluate(() => V.seats.find((s) => s.seat !== V.mySeat).seat);
      await tap(`[data-to="${target}"]`);
      await tap(`[data-kind="${best.kind}"]`);
      if (best.kind === 'is') await tap(`[data-cat="${best.cat}"]`);
      await tap(best.kind === 'tag' ? `[data-tag="${best.value}"]` : `[data-color="${best.value}"]`);
      if (!got.ask) { got.ask = 1; await shot(stu, '09-ask-panel'); }
      await tap('#do-ask');
      continue;
    }
  }
  await stu.click('#open-notes').catch(() => {});
  await sleep(300);
  await shot(stu, '13-notes');
  await stu.click('[data-close]').catch(() => {});
  await sleep(4000);
  await shot(teacher, '14-teacher-live');
  await teacher.click('#toggle-ans');
  await sleep(200);
  await shot(teacher, '15-teacher-answers');
  await teacher.click('#end'); await teacher.click('#end');
  await sleep(1200);
  await shot(teacher, '16-teacher-results');
  await shot(stu, '17-student-done');

  // 휴대폰: 혼자 연습
  const pctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const ph = await pctx.newPage();
  ph.on('pageerror', (e) => errs.push('phone: ' + e.message));
  await ph.goto(BASE + '/');
  await ph.fill('#in-name', '연습생');
  await ph.click('#go-practice');
  await ph.waitForSelector('.mission');
  await sleep(500);
  await shot(ph, '18-phone-solo');
  await ph.evaluate(() => window.scrollTo(0, 99999));
  await shot(ph, '19-phone-solo-board');
  const sw = await ph.evaluate(() => document.documentElement.scrollWidth);
  console.log('phone scrollWidth', sw);
  console.log('errors', errs);
  const tv = await teacher.evaluate(() => D.games.map((g) => g.seats.map((s) => [s.name, s.mCorrect + '/' + s.mTotal, s.asked, s.solvedRank])));
  console.log(JSON.stringify(tv));
  await browser.close();
  bots.forEach((b) => b.ws.close());
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
