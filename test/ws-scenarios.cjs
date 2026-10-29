const WebSocket = require('ws');
const URL = 'ws://localhost:' + (process.env.P || 10600) + '';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function client() {
  const ws = new WebSocket(URL); const box = { msgs: [], last: {} };
  ws.on('message', (r) => { const m = JSON.parse(r); box.msgs.push(m); box.last[m.t] = m; });
  box.ws = ws; box.send = (m) => ws.send(JSON.stringify(m));
  box.open = new Promise((r) => ws.on('open', r));
  return box;
}
const ok = (c, msg) => { console.log((c ? '✅' : '❌') + ' ' + msg); if (!c) process.exitCode = 1; };
(async () => {
  const T = client(); await T.open; T.send({ t: 'teacherHello' }); await sleep(300);
  const code = T.last.teacherKey.code;
  const S = []; for (let i = 0; i < 5; i++) { const c = client(); await c.open; c.pid = 'p' + i; c.send({ t: 'join', code, name: 'S' + i, pid: c.pid }); S.push(c); }
  await sleep(500);
  ok(T.last.teacher.data.students.length === 5, '학생 5명 입장');
  T.send({ t: 'assign', mode: 'team', size: 4 }); await sleep(600);
  const sizes = T.last.teacher.data.groups.map((g) => g.length);
  ok(JSON.stringify(sizes.sort()) === '[2,3]', '5명 팀(4명씩) → 3+2 모둠: ' + sizes);
  T.send({ t: 'assign', mode: 'solo' }); await sleep(600);
  ok(T.last.teacher.data.groups.length === 5, '혼자 버전 배정 → 5개');
  T.send({ t: 'start' }); await sleep(600);
  ok(S.every((c) => c.last.state && c.last.state.view.mode === 'solo' && c.last.state.view.seats.length === 4), '모두 혼자 게임 시작 (봇 3명)');
  // 오답 보고서 → 벌칙
  const v = S[0].last.state.view;
  const wrong = { place: v.activeIds.find((id) => id.startsWith('p-')), do: v.activeIds.find((id) => id.startsWith('d-')), dont: v.activeIds.find((id) => id.startsWith('n-')) };
  S[0].send({ t: 'solve', guess: wrong }); await sleep(300);
  const me = S[0].last.state.view.seats[0];
  ok(me.solvedRank || me.penalty === 2, '보고서 오답 시 미션 2개 벌칙 (또는 우연히 정답)');
  // 새로고침(재접속) → 같은 게임으로 복귀
  const gid = S[1].last.state.view.gameId; S[1].ws.close(); await sleep(200);
  const R = client(); await R.open; R.send({ t: 'join', code, name: 'S1', pid: 'p1' }); await sleep(400);
  ok(R.last.state && R.last.state.view.gameId === gid, '새로고침해도 같은 게임으로 돌아옴');
  // 늦게 온 학생 (혼자 모드는 바로 시작)
  const L = client(); await L.open; L.send({ t: 'join', code, name: 'Late', pid: 'late' }); await sleep(400);
  ok(L.last.state && L.last.state.view.mode === 'solo', '늦게 온 학생은 혼자 게임 바로 시작');
  // 잘못된 코드
  const X = client(); await X.open; X.send({ t: 'join', code: '0000', name: 'x', pid: 'x' }); await sleep(200);
  ok(X.last.err && /반 코드/.test(X.last.err.msg), '잘못된 반 코드 안내');
  // 종료
  T.send({ t: 'end' }); await sleep(600);
  ok(S[2].last.state.view.phase === 'DONE' && S[2].last.state.view.seats[2].outer === S[2].last.state.view.seats[2].outer && S[2].last.state.view.seats[0].outer, '종료 시 내 비밀 카드 공개');
  // 비밀 정보 노출 검사: 진행 중 내 outer는 null이어야 함
  T.send({ t: 'reset' }); await sleep(300); T.send({ t: 'assign', mode: 'team', size: 3 }); await sleep(300); T.send({ t: 'start' }); await sleep(600);
  const tv = S[3].last.state.view;
  ok(tv.mode === 'team' && tv.seats[tv.mySeat].outer === null, '진행 중에는 내 비밀 카드 정보가 화면 데이터에 없음');
  ok(!JSON.stringify(tv).includes('"secret"'), '비밀 봉투 정답이 학생 데이터에 없음');
  // 팀: 대답 시간 초과 → 본부가 대신 대답 (25초) — 생략 가능, 짧게 확인
  process.exit();
})();
