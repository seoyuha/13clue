import { useState } from 'react';
import type { SavedSession } from './types';
import { STARTING_TOKENS, parseRoomCode } from './logic/setupGame';
import { clearSession, loadSession, saveSession } from './logic/storage';
import Lobby from './components/Lobby';
import GameScreen from './components/GameScreen';
import RulesModal from './components/RulesModal';
import VideoModal from './components/VideoModal';

function restore(): SavedSession | null {
  const s = loadSession();
  if (!s) return null;
  const n = parseRoomCode(s.roomId);
  if (n === null || s.seat < 0 || s.seat >= n) return null;
  return s;
}

export default function App() {
  const [session, setSession] = useState<SavedSession | null>(restore);
  const [showRules, setShowRules] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  const update = (s: SavedSession) => {
    setSession(s);
    saveSession(s);
  };

  if (session) {
    return (
      <GameScreen
        session={session}
        onUpdate={update}
        onExit={() => {
          clearSession();
          setSession(null);
        }}
      />
    );
  }

  return (
    <>
      <Lobby
        onEnter={(roomId, seat, name, playerNames) =>
          update({ roomId, seat, name, playerNames, tokens: STARTING_TOKENS, marks: {} })
        }
      />

      {/* 화면 한켠 (우측 상단): 게임 소개 영상 & 게임 규칙 안내 */}
      <aside className="corner-nav" aria-label="게임 안내 및 영상 링크">
        <button
          id="btn-video-guide"
          className="corner-badge-video"
          onClick={() => setShowVideo(true)}
          title="13개의 증거 게임 소개 영상 시청하기"
        >
          <span className="badge-play-icon">▶</span>
          <span className="badge-text badge-text-desktop">게임 소개 영상 보러가기</span>
          <span className="badge-text badge-text-mobile">영상 안내</span>
        </button>

        <button
          id="help-button-lobby"
          className="corner-badge-rules"
          onClick={() => setShowRules(true)}
          title="게임 규칙 설명서 보기"
        >
          <span>📜</span>
          <span className="badge-text badge-text-desktop">게임 규칙</span>
          <span className="badge-text badge-text-mobile">규칙</span>
        </button>
      </aside>

      {showVideo && <VideoModal onClose={() => setShowVideo(false)} />}
      {showRules && <RulesModal onClose={() => setShowRules(false)} />}
    </>
  );
}

