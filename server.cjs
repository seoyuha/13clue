// 13 Clues – Eco Detectives 서버
//  /          학생 화면
//  /teacher   교사 관리 화면
//  /classic   원래 13개의 증거 디지털 도구
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { WebSocketServer, WebSocket } = require('ws');
const E = require('./game/engine.cjs');
const { CARDS, COLORS, TAGS, CATEGORIES } = require('./game/cards.cjs');

const PORT = process.env.PORT || 8080;
const PUB = path.join(__dirname, 'public');

// ───────────────────────── HTTP ─────────────────────────
const ROUTES = {
  '/': ['public/index.html', 'text/html'],
  '/index.html': ['public/index.html', 'text/html'],
  '/teacher': ['public/teacher.html', 'text/html'],
  '/teacher.html': ['public/teacher.html', 'text/html'],
  '/classic': ['classic/index.html', 'text/html'],
  '/classic/': ['classic/index.html', 'text/html'],
  '/shared.js': ['public/shared.js', 'application/javascript'],
  '/shared.css': ['public/shared.css', 'text/css'],
};

const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];
  if (url === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ status: 'ok', server: '13clues-eco', sessions: sessions.size, time: Date.now() }));
    return;
  }
  if (url === '/api/data') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-cache' });
    res.end(JSON.stringify({ CARDS, COLORS, TAGS, CATEGORIES }));
    return;
  }
  const r = ROUTES[url];
  if (!r) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); res.end('Not found'); return; }
  const file = path.join(__dirname, r[0]);
  if (!fs.existsSync(file)) { res.writeHead(404); res.end('missing'); return; }
  res.writeHead(200, { 'Content-Type': `${r[1]}; charset=utf-8`, 'Cache-Control': 'no-cache' });
  fs.createReadStream(file).pipe(res);
});

// ───────────────────────── 상태 ─────────────────────────
const sessions = new Map();   // code -> session
const games = new Map();      // gameId -> { g, sessionCode|null }
const conns = new Map();      // ws -> { role, code, pid }
const legacyRooms = new Map(); // 원래 게임용 방 중계

const rid = (n = 8) => crypto.randomBytes(n).toString('hex');

function newCode() {
  let c;
  do { c = String(Math.floor(1000 + Math.random() * 9000)); } while (sessions.has(c));
  return c;
}

function send(ws, msg) {
  if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(msg));
}

function socketsOf(pred) {
  const out = [];
  for (const [ws, c] of conns) if (pred(c)) out.push(ws);
  return out;
}

// ───────────────────────── 모둠 자동 배정 ─────────────────────────
function makeGroups(pids, mode, size) {
  const list = pids.slice().sort(() => Math.random() - 0.5);
  if (mode === 'solo' || list.length < 2) return list.map((p) => [p]);
  const pref = size === 3 ? 3 : 4;
  const g = Math.max(1, Math.ceil(list.length / pref));
  const groups = Array.from({ length: g }, () => []);
  list.forEach((p, i) => groups[i % g].push(p));
  // 5명 이상 모둠은 나누기
  return groups.flatMap((gr) => (gr.length > 5 ? [gr.slice(0, Math.ceil(gr.length / 2)), gr.slice(Math.ceil(gr.length / 2))] : [gr]));
}

// ───────────────────────── 브로드캐스트 ─────────────────────────
function pushGame(gameId) {
  const entry = games.get(gameId);
  if (!entry) return;
  const { g } = entry;
  g.seats.forEach((s, i) => {
    if (s.bot) return;
    const view = E.viewFor(g, i);
    socketsOf((c) => c.role === 'student' && c.pid === s.pid).forEach((ws) => send(ws, { t: 'state', view }));
  });
  if (entry.code) pushTeacher(entry.code);
}

const teacherTimers = new Map();
function pushTeacher(code) {
  if (teacherTimers.has(code)) return; // 0.4초 묶음 전송
  teacherTimers.set(code, setTimeout(() => {
    teacherTimers.delete(code);
    const s = sessions.get(code);
    if (!s) return;
    const data = teacherData(s);
    socketsOf((c) => c.role === 'teacher' && c.code === code).forEach((ws) => send(ws, { t: 'teacher', data }));
  }, 400));
}

function teacherData(s) {
  const gameViews = s.gameIds.map((id) => games.get(id)).filter(Boolean).map((e) => E.teacherView(e.g));
  const miss = {};
  s.gameIds.forEach((id) => {
    const e = games.get(id);
    if (!e) return;
    Object.entries(e.g.missStats).forEach(([qid, st]) => {
      const m = (miss[qid] = miss[qid] || { wrong: 0, total: 0 });
      m.wrong += st.wrong;
      m.total += st.total;
    });
  });
  const missList = Object.entries(miss)
    .map(([qid, m]) => {
      const q = E.QMAP[qid];
      return { qid, ...m, skill: q.skill, label: q.text || q.say || (q.words ? q.words.join(' ') : q.pic), answer: q.type === 'choice' ? q.answer : q.words.join(' ') };
    })
    .sort((a, b) => b.wrong - a.wrong || b.total - a.total)
    .slice(0, 12);
  return {
    code: s.code,
    status: s.status,
    mode: s.mode,
    size: s.size,
    createdAt: s.createdAt,
    startedAt: s.startedAt,
    students: Object.values(s.students).map((st) => ({
      pid: st.pid,
      name: st.name,
      online: socketsOf((c) => c.role === 'student' && c.pid === st.pid && c.code === s.code).length > 0,
      gameId: st.gameId || null,
    })),
    groups: s.groups,
    games: gameViews,
    miss: missList,
  };
}

function pushLobby(s) {
  Object.values(s.students).forEach((st) => {
    if (st.gameId) return;
    const grp = s.groups.find((gr) => gr.includes(st.pid));
    const mates = grp ? grp.map((p) => s.students[p]?.name).filter(Boolean) : [];
    socketsOf((c) => c.role === 'student' && c.pid === st.pid).forEach((ws) =>
      send(ws, { t: 'lobby', code: s.code, name: st.name, status: s.status, mode: s.mode, mates }));
  });
  pushTeacher(s.code);
}

// ───────────────────────── 게임 시작 ─────────────────────────
function startGroup(s, pids, idx) {
  const players = pids.map((p) => ({ pid: p, name: s.students[p].name }));
  const mode = pids.length === 1 ? 'solo' : 'team';
  const id = `${s.code}-${rid(3)}`;
  const teamName = mode === 'team' ? `${idx + 1}모둠` : players[0].name;
  const g = E.createGame({ id, mode, players, teamName });
  games.set(id, { g, code: s.code });
  s.gameIds.push(id);
  pids.forEach((p) => { s.students[p].gameId = id; });
  return id;
}

function startSession(s) {
  s.status = 'PLAYING';
  s.startedAt = Date.now();
  s.groups.forEach((gr, i) => {
    const pids = gr.filter((p) => s.students[p] && !s.students[p].gameId);
    if (pids.length) pushGame(startGroup(s, pids, i));
  });
  pushTeacher(s.code);
}

// ───────────────────────── 메시지 처리 ─────────────────────────
function findSeat(pid, code) {
  if (code) {
    const st = sessions.get(code)?.students[pid];
    const e = st && st.gameId && games.get(st.gameId);
    if (!e) return null;
    return { id: st.gameId, e, i: e.g.seats.findIndex((s) => s.pid === pid) };
  }
  for (const [id, e] of games) {
    if (e.code) continue;
    const i = e.g.seats.findIndex((s) => s.pid === pid);
    if (i >= 0 && !e.g.abandoned) return { id, e, i };
  }
  return null;
}

function handle(ws, m) {
  const c = conns.get(ws);

  // ── 교사 ──
  if (m.t === 'teacherHello') {
    let s = m.code && sessions.get(String(m.code));
    if (s && s.key !== m.key) s = null;
    if (!s) {
      const code = newCode();
      s = { code, key: rid(8), students: {}, groups: [], status: 'LOBBY', mode: 'team', size: 4, gameIds: [], createdAt: Date.now(), startedAt: null };
      sessions.set(code, s);
    }
    conns.set(ws, { role: 'teacher', code: s.code });
    send(ws, { t: 'teacherKey', code: s.code, key: s.key });
    send(ws, { t: 'teacher', data: teacherData(s) });
    return;
  }
  if (c && c.role === 'teacher') {
    const s = sessions.get(c.code);
    if (!s) return;
    if (m.t === 'assign') {
      s.mode = m.mode === 'solo' ? 'solo' : 'team';
      s.size = m.size === 3 ? 3 : 4;
      const waiting = Object.keys(s.students).filter((p) => !s.students[p].gameId);
      s.groups = makeGroups(waiting, s.mode, s.size);
      if (s.status === 'LOBBY') s.status = 'ASSIGNED';
      pushLobby(s);
    } else if (m.t === 'move') {
      // 학생을 다른 모둠으로 옮기기 (to = 모둠 번호, -1이면 새 모둠)
      s.groups = s.groups.map((gr) => gr.filter((p) => p !== m.pid));
      if (m.to >= 0 && s.groups[m.to]) s.groups[m.to].push(m.pid);
      else s.groups.push([m.pid]);
      s.groups = s.groups.filter((gr) => gr.length);
      pushLobby(s);
    } else if (m.t === 'start') {
      if (!s.groups.length) return send(ws, { t: 'err', msg: '먼저 자동 배정을 눌러 주세요.' });
      startSession(s);
    } else if (m.t === 'startLate') {
      // 늦게 온 학생: 대기 중인 학생 혼자 게임으로 시작
      const waiting = Object.keys(s.students).filter((p) => !s.students[p].gameId);
      waiting.forEach((p) => pushGame(startGroup(s, [p], 0)));
      pushTeacher(s.code);
    } else if (m.t === 'end') {
      s.gameIds.forEach((id) => { const e = games.get(id); if (e) { E.endGame(e.g); pushGame(id); } });
      s.status = 'ENDED';
      pushTeacher(s.code);
    } else if (m.t === 'reset') {
      // 새 판: 학생은 그대로, 게임 기록 지우기
      s.gameIds.forEach((id) => { const e = games.get(id); if (e) e.g.abandoned = true; games.delete(id); });
      s.gameIds = [];
      Object.values(s.students).forEach((st) => { st.gameId = null; });
      s.groups = [];
      s.status = 'LOBBY';
      s.startedAt = null;
      pushLobby(s);
    } else if (m.t === 'kick') {
      delete s.students[m.pid];
      s.groups = s.groups.map((gr) => gr.filter((p) => p !== m.pid)).filter((gr) => gr.length);
      socketsOf((x) => x.role === 'student' && x.pid === m.pid).forEach((w) => send(w, { t: 'kicked' }));
      pushLobby(s);
    }
    return;
  }

  // ── 학생 입장 ──
  if (m.t === 'join') {
    const s = sessions.get(String(m.code || ''));
    const name = String(m.name || '').trim().slice(0, 12);
    if (!s) return send(ws, { t: 'err', msg: '반 코드를 다시 확인해 주세요.', code: 'nocode' });
    if (!name) return send(ws, { t: 'err', msg: '이름을 입력해 주세요.' });
    const pid = String(m.pid || rid(6));
    conns.set(ws, { role: 'student', code: s.code, pid });
    if (!s.students[pid]) {
      s.students[pid] = { pid, name, gameId: null };
      // 이미 시작한 수업에 늦게 들어오면: 혼자 모드는 바로 시작, 팀 모드는 교사 화면에서 시작
      if (s.status === 'PLAYING' && s.mode === 'solo') pushGame(startGroup(s, [pid], 0));
    } else {
      s.students[pid].name = name;
    }
    send(ws, { t: 'joined', pid, code: s.code, name });
    const st = s.students[pid];
    if (st.gameId && games.has(st.gameId)) pushGame(st.gameId);
    else pushLobby(s);
    return;
  }

  // ── 혼자 연습 (교사 코드 없이) ──
  if (m.t === 'practice') {
    const pid = String(m.pid || rid(6));
    const name = String(m.name || '탐정').trim().slice(0, 12) || '탐정';
    conns.set(ws, { role: 'student', code: null, pid });
    const old = findSeat(pid);
    if (old && !old.e.code) { old.e.g.abandoned = true; games.delete(old.id); }
    const id = `p-${rid(4)}`;
    games.set(id, { g: E.createGame({ id, mode: 'solo', players: [{ pid, name }] }), code: null });
    send(ws, { t: 'joined', pid, code: null, name });
    pushGame(id);
    return;
  }

  if (m.t === 'resume') {
    const pid = String(m.pid || '');
    const found = pid && findSeat(pid, null);
    if (!found) return send(ws, { t: 'noResume' });
    conns.set(ws, { role: 'student', code: found.e.code, pid });
    pushGame(found.id);
    return;
  }

  // ── 게임 행동 ──
  if (!c || c.role !== 'student') return;
  const found = findSeat(c.pid, c.code);
  if (!found) return;
  const { g } = found.e;
  const si = found.i;
  let r;
  if (m.t === 'mission') r = E.answerMission(g, si, m.answer);
  else if (m.t === 'ask') r = E.ask(g, si, Number(m.to), m.q);
  else if (m.t === 'answer') r = E.answerAsk(g, si, m.id, m.n);
  else if (m.t === 'peek') r = E.peek(g, si, String(m.letter));
  else if (m.t === 'solve') r = E.solve(g, si, m.guess);
  else return;
  if (r && r.error) send(ws, { t: 'err', msg: r.error });
  if (r && r.retry) send(ws, { t: 'retry', msg: '다시 세어 보세요! Count again.' });
  if (r && m.t === 'solve') send(ws, { t: 'solveResult', ok: r.ok });
  if (r && m.t === 'peek' && r.ok) send(ws, { t: 'peekResult', cardId: r.cardId });
  pushGame(found.id);
}

// ───────────────────────── WebSocket ─────────────────────────
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  let legacyRoom = null;
  ws.on('message', (raw) => {
    let m;
    try { m = JSON.parse(raw.toString()); } catch { return; }
    // 원래 13개의 증거(classic) 방 중계 호환
    if (m && m.action) {
      if (m.action === 'join' && m.roomId) {
        legacyRoom = String(m.roomId);
        if (!legacyRooms.has(legacyRoom)) legacyRooms.set(legacyRoom, new Set());
        legacyRooms.get(legacyRoom).add(ws);
        return;
      }
      const room = String(m.roomId || legacyRoom);
      const payload = JSON.stringify(m.action === 'broadcast' ? m.data : m);
      (legacyRooms.get(room) || []).forEach((w) => { if (w !== ws && w.readyState === WebSocket.OPEN) w.send(payload); });
      return;
    }
    try { handle(ws, m); } catch (e) { console.error(e); send(ws, { t: 'err', msg: '서버 오류가 났어요. 다시 시도해 주세요.' }); }
  });
  ws.on('close', () => {
    const c = conns.get(ws);
    conns.delete(ws);
    if (legacyRoom && legacyRooms.has(legacyRoom)) {
      legacyRooms.get(legacyRoom).delete(ws);
      if (!legacyRooms.get(legacyRoom).size) legacyRooms.delete(legacyRoom);
    }
    if (c && c.code) pushTeacher(c.code);
  });
});

// 친구 대답 시간 초과 처리 + 오래된 세션 정리
setInterval(() => {
  for (const [id, e] of games) if (E.tick(e.g)) pushGame(id);
}, 1000);

setInterval(() => {
  const old = Date.now() - 6 * 3600 * 1000;
  for (const [code, s] of sessions) if (s.createdAt < old) {
    s.gameIds.forEach((id) => games.delete(id));
    sessions.delete(code);
  }
  for (const [id, e] of games) if (!e.code && e.g.startedAt < old) games.delete(id);
}, 10 * 60 * 1000);

// 연결 유지 (Render 프록시 유휴 끊김 방지)
setInterval(() => wss.clients.forEach((ws) => { try { ws.ping(); } catch {} }), 25000);

server.listen(PORT, () => console.log(`🕵️ 13 Clues – Eco Detectives : http://localhost:${PORT}  (교사: /teacher)`));
