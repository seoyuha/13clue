import Modal from './Modal';

interface Props {
  onClose: () => void;
}

export const YOUTUBE_INTRO_URL = 'https://www.youtube.com/watch?v=jTd5wEva_WE&t=12s';
const EMBED_URL = 'https://www.youtube.com/embed/jTd5wEva_WE?start=12&autoplay=1';

export default function VideoModal({ onClose }: Props) {
  return (
    <Modal title="🎬 13개의 증거 게임 소개 & 룰 설명 영상" onClose={onClose} width={760}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div
          style={{
            position: 'relative',
            width: '100%',
            paddingBottom: '56.25%',
            background: '#000',
            borderRadius: 12,
            overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
            border: '1px solid var(--border)',
          }}
        >
          <iframe
            src={EMBED_URL}
            title="13개의 증거 게임 소개 영상"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              border: 'none',
            }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 10,
            marginTop: 4,
          }}
        >
          <span style={{ fontSize: 13, color: 'var(--text-dim)' }}>
            💡 영상이 재생되지 않거나 전체화면으로 크게 보시려면 아래 YouTube 버튼을 눌러주세요.
          </span>
          <div style={{ display: 'flex', gap: 10 }}>
            <a
              href={YOUTUBE_INTRO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                textDecoration: 'none',
                fontSize: 13,
                fontWeight: 600,
                padding: '8px 16px',
                background: '#dc2626',
                color: '#ffffff',
                borderRadius: 8,
                boxShadow: '0 4px 12px rgba(220, 38, 38, 0.35)',
              }}
            >
              <span>YouTube에서 직접 보기</span>
              <span>↗</span>
            </a>
            <button className="btn btn-ghost" onClick={onClose} style={{ fontSize: 13 }}>
              닫기
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
