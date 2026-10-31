const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { WebSocketServer, WebSocket } = require('ws');

const PORT = process.env.PORT || 8080;

// 내 PC의 로컬 IPv4 주소 찾기
function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const localIp = getLocalIp();

// 1. HTTP 웹 서버 (index.html 제공)
const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // 상태 체크 API
  if (req.url === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ status: 'ok', server: '13clues-relay', time: Date.now() }));
    return;
  }

  // index.html 정적 파일 서빙
  const indexPath = path.join(__dirname, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    fs.createReadStream(indexPath).pipe(res);
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>13개의 증거 실시간 서버 가동 중</h1><p>index.html 파일이 빌드되지 않았습니다.</p>');
  }
});

// 2. WebSocket 실시간 룸 중계 서버
const wss = new WebSocketServer({ server });

// 방별 소켓 집합 (roomId -> Set of WebSockets)
const rooms = new Map();

wss.on('connection', (ws) => {
  let currentRoom = null;

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());

      // 룸 입장
      if (data.action === 'join' && data.roomId) {
        currentRoom = String(data.roomId);
        if (!rooms.has(currentRoom)) {
          rooms.set(currentRoom, new Set());
        }
        rooms.get(currentRoom).add(ws);
        return;
      }

      // 룸 메시지 전체 브로드캐스트
      if (data.action === 'broadcast' && data.roomId && data.data) {
        const targetRoom = String(data.roomId);
        const clients = rooms.get(targetRoom);
        if (clients) {
          const payload = JSON.stringify(data.data);
          clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(payload);
            }
          });
        }
        return;
      }

      // 일반 이벤트 수신 시 (roomId가 포함되어 있거나 이전 join된 룸 대상)
      const targetRoom = String(data.roomId || currentRoom);
      if (targetRoom && rooms.has(targetRoom)) {
        const payload = JSON.stringify(data);
        rooms.get(targetRoom).forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(payload);
          }
        });
      }
    } catch (e) {
      // JSON 파싱 실패 무시
    }
  });

  ws.on('close', () => {
    if (currentRoom && rooms.has(currentRoom)) {
      const roomSet = rooms.get(currentRoom);
      roomSet.delete(ws);
      if (roomSet.size === 0) {
        rooms.delete(currentRoom);
      }
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('\n=============================================================');
  console.log('  🕵️‍♂️ 13개의 증거 — 초등학교 교실 전용 실시간 중계 서버');
  console.log('=============================================================');
  console.log(`  🟢 상태: 정상 가동 중 (Port: ${PORT})`);
  console.log('');
  console.log('  📱 학생 태블릿 브라우저에서 아래 주소로 접속하면 바로 게임이 열립니다:');
  console.log(`     👉 http://${localIp}:${PORT}`);
  console.log('');
  console.log('  🌐 또는 태블릿에서 웹소켓 주소로 연결할 때:');
  console.log(`     👉 ws://${localIp}:${PORT}`);
  console.log('');
  console.log('  💡 시도교육청 스쿨넷 방화벽이나 외부 인터넷 차단과 무관하게');
  console.log('     같은 교실 Wi-Fi에 연결된 모든 기기가 100% 실시간 연동됩니다.');
  console.log('=============================================================\n');
});
