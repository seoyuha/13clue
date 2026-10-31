import type { Card } from '../types';
import { CATEGORY_LABEL, COLOR_HEX } from '../data/cards';
import { CARD_SVG_ART } from '../data/cardArt';
import { EMBEDDED_JPG_ART } from '../data/cardBase64';

interface Props {
  card: Card;
  size?: 'small' | 'normal' | 'large';
  className?: string;
  style?: React.CSSProperties;
  label?: string; // e.g. "왼쪽 카드", "오른쪽 카드"
}

const ATTR_ICON: Record<string, string> = {
  남성: '♂',
  여성: '♀',
  실내: '🏛️',
  야외: '🌳',
  근접: '⚔️',
  원거리: '🏹',
};

/**
 * 13개의 증거 카드 컴포넌트:
 * - 30장 모든 카드의 일러스트가 HTML/JS 내부에 100% 내장됨 (Zero External Dependency)
 * - 12개 AI 초고화질 일러스트 (Base64 인라인) + 18개 빅토리아풍 SVG 벡터 아트 (인라인)
 * - 외부 cards/ 폴더가 없거나 단일 index.html만 실행해도 무조건 100% 완전한 그림 출력!
 */
export default function CardView({ card, size = 'normal', className = '', style, label }: Props) {
  const sizeClass = size === 'normal' ? '' : size;
  const colorHex = COLOR_HEX[card.color] || '#888';

  // 1. 12장 AI 초고화질 JPG (HTML 내장 Base64)
  const embeddedJpg = EMBEDDED_JPG_ART[card.id];
  // 2. 18장 빅토리아풍 SVG 벡터 아트 (HTML 내장 SVG - 슬라이스 스케일링 보장)
  const rawSvg = CARD_SVG_ART[card.id];
  const svgArt = rawSvg
    ? (rawSvg.includes('preserveAspectRatio')
        ? rawSvg
        : rawSvg.replace('<svg ', '<svg preserveAspectRatio="xMidYMid slice" '))
    : null;

  return (
    <div
      className={`game-card ${sizeClass} ${className}`}
      data-cat={card.category}
      style={{
        ...style,
        ['--card-color' as any]: colorHex,
      }}
      aria-label={`${card.color} ${CATEGORY_LABEL[card.category]} ${card.name} (${card.attribute})`}
    >
      {label && <div className="card-top-label">{label}</div>}

      <div className="cat-strip" style={{ backgroundColor: colorHex }}>
        <span className="strip-cat">{CATEGORY_LABEL[card.category]}</span>
        <span className="strip-color-name">{card.color}</span>
        <span className="strip-attr">{ATTR_ICON[card.attribute] || ''}</span>
      </div>

      <div className="art">
        {embeddedJpg ? (
          <img
            src={embeddedJpg}
            alt={card.name}
            draggable={false}
          />
        ) : svgArt ? (
          <div
            className="svg-art-wrap"
            dangerouslySetInnerHTML={{ __html: svgArt }}
          />
        ) : (
          <span className="emoji" aria-hidden>
            {card.emoji}
          </span>
        )}
      </div>

      <div className="name">{card.name}</div>

      <div className="badge-row">
        <span className="attr-badge">
          {ATTR_ICON[card.attribute]} {card.attribute}
        </span>
      </div>
    </div>
  );
}
