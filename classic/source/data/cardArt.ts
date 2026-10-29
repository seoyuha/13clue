/**
 * 13개의 증거 빅토리아 런던 느와르 스타일의 30장 카드 일러스트 SVG 벡터 아트
 * - 2:3 비율 (viewBox="0 0 400 600")
 * - 딥 네이비 밤하늘, 안개 비네팅, 따뜻한 금빛 가스등 조명 하이라이트
 * - 이미지가 없는 환경에서도 100% 완전하게 렌더링되는 자급자족형 고해상도 그래픽
 */

export const CARD_SVG_ART: Record<string, string> = {
  // ── 장소 (Locations) ──
  'l-dock': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" width="100%" height="100%">
      <defs>
        <radialGradient id="sky-dock" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stop-color="#2a3356"/>
          <stop offset="50%" stop-color="#141a33"/>
          <stop offset="100%" stop-color="#080c1c"/>
        </radialGradient>
        <radialGradient id="lamp-glow" cx="72%" cy="42%" r="35%">
          <stop offset="0%" stop-color="#ffea9f" stop-opacity="0.9"/>
          <stop offset="30%" stop-color="#e6a13b" stop-opacity="0.45"/>
          <stop offset="100%" stop-color="#e6a13b" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#0e172e"/>
          <stop offset="50%" stop-color="#080e1e"/>
          <stop offset="100%" stop-color="#040710"/>
        </linearGradient>
      </defs>
      <rect width="400" height="600" fill="url(#sky-dock)"/>
      <circle cx="288" cy="252" r="160" fill="url(#lamp-glow)"/>
      <!-- 먼 바다와 배 실루엣 -->
      <path d="M40 330 Q80 325 120 330 L110 315 L140 315 L130 330 Z" fill="#182038" opacity="0.6"/>
      <line x1="125" y1="260" x2="125" y2="315" stroke="#182038" stroke-width="2" opacity="0.6"/>
      <path d="M125 270 L155 285 L125 300 Z" fill="#182038" opacity="0.4"/>
      <!-- 수면 -->
      <rect y="360" width="400" height="240" fill="url(#water)"/>
      <line x1="240" y1="380" x2="330" y2="380" stroke="#f1c40f" stroke-width="1.5" opacity="0.3"/>
      <line x1="250" y1="410" x2="320" y2="410" stroke="#f1c40f" stroke-width="1" opacity="0.2"/>
      <!-- 목재 부두 데크 -->
      <polygon points="0,480 400,390 400,600 0,600" fill="#1c1612"/>
      <polygon points="0,480 400,390 400,410 0,500" fill="#2d221a"/>
      <!-- 부두 기둥들 -->
      <rect x="30" y="450" width="22" height="150" fill="#130e0b"/>
      <rect x="160" y="410" width="20" height="190" fill="#15100d"/>
      <rect x="290" y="380" width="24" height="220" fill="#1a1410"/>
      <!-- 가스등 포스트 -->
      <path d="M285 390 L291 250 L283 250 L288 230 L288 200 L292 200 L292 230 L297 250 L289 250 Z" fill="#0a0807"/>
      <!-- 가스등 랜턴 헤드 -->
      <polygon points="274,250 306,250 298,225 282,225" fill="#ffd56b" stroke="#0a0807" stroke-width="3"/>
      <polygon points="280,225 300,225 290,210" fill="#0a0807"/>
      <!-- 안개 띠 -->
      <ellipse cx="200" cy="370" rx="190" ry="15" fill="#a4b0be" opacity="0.12"/>
      <!-- 밧줄과 닻 실루엣 -->
      <circle cx="90" cy="510" r="16" fill="none" stroke="#3a2f26" stroke-width="6"/>
      <path d="M80 525 Q90 550 120 535" stroke="#4a3c30" stroke-width="4" fill="none"/>
    </svg>
  `,

  'l-park': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" width="100%" height="100%">
      <defs>
        <radialGradient id="sky-park" cx="50%" cy="25%" r="75%">
          <stop offset="0%" stop-color="#3b2b48"/>
          <stop offset="50%" stop-color="#1e1828"/>
          <stop offset="100%" stop-color="#0a0810"/>
        </radialGradient>
        <radialGradient id="park-glow" cx="30%" cy="40%" r="32%">
          <stop offset="0%" stop-color="#ffeaa7" stop-opacity="0.9"/>
          <stop offset="40%" stop-color="#fdcb6e" stop-opacity="0.3"/>
          <stop offset="100%" stop-color="#fdcb6e" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="400" height="600" fill="url(#sky-park)"/>
      <circle cx="120" cy="240" r="140" fill="url(#park-glow)"/>
      <!-- 안개 낀 큰 고목들 -->
      <path d="M300 380 Q320 220 340 100 Q360 80 390 60 Q340 130 330 220 Q350 170 380 140 Q340 220 330 380 Z" fill="#130f18"/>
      <path d="M0 340 Q50 200 40 80 Q60 130 70 200 Q100 150 130 110 Q80 200 70 340 Z" fill="#130f18" opacity="0.8"/>
      <!-- 돌길 -->
      <path d="M40 600 L160 380 L220 380 L360 600 Z" fill="#18151c"/>
      <!-- 가스등 기둥 -->
      <rect x="116" y="240" width="6" height="150" fill="#08070a"/>
      <polygon points="106,240 132,240 126,215 112,215" fill="#ffeaa7" stroke="#08070a" stroke-width="2.5"/>
      <polygon points="110,215 128,215 119,200" fill="#08070a"/>
      <!-- 클래식 공원 벤치 -->
      <rect x="190" y="410" width="130" height="8" rx="3" fill="#3d2d1f"/>
      <rect x="190" y="424" width="130" height="8" rx="3" fill="#3d2d1f"/>
      <rect x="190" y="445" width="130" height="10" rx="3" fill="#2d2015"/>
      <!-- 벤치 철제 프레임 -->
      <path d="M195 410 L195 470 L205 470 L205 445 L200 410" fill="#0b0a0d"/>
      <path d="M315 410 L315 470 L325 470 L325 445 L320 410" fill="#0b0a0d"/>
      <circle cx="120" cy="228" r="4" fill="#fff"/>
      <!-- 흩날리는 나뭇잎 실루엣 -->
      <ellipse cx="180" cy="480" rx="6" ry="3" fill="#a29bfe" opacity="0.2"/>
      <ellipse cx="230" cy="520" rx="7" ry="4" fill="#a29bfe" opacity="0.25"/>
    </svg>
  `,

  'l-market': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" width="100%" height="100%">
      <defs>
        <radialGradient id="sky-mkt" cx="50%" cy="20%" r="70%">
          <stop offset="0%" stop-color="#3d2024"/>
          <stop offset="60%" stop-color="#1a0c0e"/>
          <stop offset="100%" stop-color="#0a0506"/>
        </radialGradient>
        <radialGradient id="mkt-glow" cx="50%" cy="32%" r="35%">
          <stop offset="0%" stop-color="#ffcc66" stop-opacity="0.8"/>
          <stop offset="50%" stop-color="#e17055" stop-opacity="0.3"/>
          <stop offset="100%" stop-color="#e17055" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="400" height="600" fill="url(#sky-mkt)"/>
      <circle cx="200" cy="190" r="160" fill="url(#mkt-glow)"/>
      <!-- 배경 빅토리아 건물 실루엣 -->
      <polygon points="20,250 20,120 70,80 120,120 120,250" fill="#140b0d"/>
      <polygon points="280,250 280,100 330,60 380,100 380,250" fill="#140b0d"/>
      <!-- 시장 천막 천 -->
      <polygon points="30,280 370,280 390,320 10,320" fill="#a33a30"/>
      <polygon points="60,280 100,280 90,320 50,320" fill="#d97d74"/>
      <polygon points="140,280 180,280 170,320 130,320" fill="#d97d74"/>
      <polygon points="220,280 260,280 250,320 210,320" fill="#d97d74"/>
      <polygon points="300,280 340,280 330,320 290,320" fill="#d97d74"/>
      <!-- 천막 지지대 목재 -->
      <rect x="40" y="320" width="8" height="200" fill="#2d1c16"/>
      <rect x="352" y="320" width="8" height="200" fill="#2d1c16"/>
      <!-- 나무 가판대와 상자들 -->
      <polygon points="50,420 350,420 370,490 30,490" fill="#3b2518"/>
      <rect x="50" y="490" width="300" height="80" fill="#24170f"/>
      <!-- 라탄 바구니들 -->
      <ellipse cx="110" cy="420" rx="35" ry="18" fill="#c88b48"/>
      <ellipse cx="110" cy="416" rx="30" ry="14" fill="#a4682c"/>
      <ellipse cx="200" cy="420" rx="38" ry="18" fill="#c88b48"/>
      <ellipse cx="290" cy="420" rx="34" ry="18" fill="#c88b48"/>
      <!-- 걸려있는 앤티크 오일 램프 -->
      <line x1="200" y1="280" x2="200" y2="330" stroke="#0a0807" stroke-width="3"/>
      <polygon points="190,345 210,345 206,330 194,330" fill="#ffeaa7" stroke="#0a0807" stroke-width="2"/>
    </svg>
  `,

  'l-cemetery': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" width="100%" height="100%">
      <defs>
        <radialGradient id="moon-glow" cx="75%" cy="20%" r="50%">
          <stop offset="0%" stop-color="#b8e994" stop-opacity="0.8"/>
          <stop offset="30%" stop-color="#2ecc71" stop-opacity="0.25"/>
          <stop offset="100%" stop-color="#000" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="cemetery-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#14261d"/>
          <stop offset="60%" stop-color="#0a140f"/>
          <stop offset="100%" stop-color="#050a07"/>
        </linearGradient>
      </defs>
      <rect width="400" height="600" fill="url(#cemetery-sky)"/>
      <circle cx="300" cy="120" r="160" fill="url(#moon-glow)"/>
      <!-- 창백한 보름달 -->
      <circle cx="300" cy="120" r="42" fill="#e8f8e8"/>
      <!-- 구부러진 고목 실루엣 -->
      <path d="M40 380 Q70 200 60 70 Q90 120 80 200 Q120 160 140 120 Q100 220 90 380 Z" fill="#080f0b"/>
      <!-- 언덕과 비석들 -->
      <ellipse cx="200" cy="520" rx="260" ry="100" fill="#0d1812"/>
      <!-- 중앙 커다란 십자가 석조 묘비 -->
      <path d="M185 460 L185 280 L160 280 L160 260 L185 260 L185 230 L215 230 L215 260 L240 260 L240 280 L215 280 L215 460 Z" fill="#203027"/>
      <rect x="150" y="460" width="100" height="30" rx="4" fill="#18241d"/>
      <!-- 주변 작은 묘비들 -->
      <path d="M70 450 Q90 410 110 450 L110 490 L70 490 Z" fill="#18241d"/>
      <path d="M290 440 Q310 390 330 440 L330 480 L290 480 Z" fill="#18241d"/>
      <!-- 철제 창살 울타리 -->
      <path d="M0 480 L400 480 M20 440 L20 490 M50 440 L50 490 M80 440 L80 490 M320 440 L320 490 M350 440 L350 490 M380 440 L380 490" stroke="#0e1712" stroke-width="3"/>
      <!-- 자욱한 녹색빛 안개 -->
      <ellipse cx="200" cy="490" rx="200" ry="25" fill="#55efc4" opacity="0.1"/>
    </svg>
  `,

  'l-alley': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" width="100%" height="100%">
      <defs>
        <radialGradient id="alley-glow" cx="50%" cy="35%" r="45%">
          <stop offset="0%" stop-color="#ffeaa7" stop-opacity="0.85"/>
          <stop offset="40%" stop-color="#fdcb6e" stop-opacity="0.35"/>
          <stop offset="100%" stop-color="#fdcb6e" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="400" height="600" fill="#0f0e0a"/>
      <circle cx="200" cy="210" r="180" fill="url(#alley-glow)"/>
      <!-- 양쪽 좁은 빅토리아 벽돌 건물 원근감 -->
      <polygon points="0,0 120,240 120,600 0,600" fill="#241b12"/>
      <polygon points="400,0 280,240 280,600 400,600" fill="#1f170f"/>
      <!-- 골목 바닥 (원근 조약돌) -->
      <polygon points="120,240 280,240 400,600 0,600" fill="#16120e"/>
      <!-- 벽돌 패턴 라인 -->
      <line x1="20" y1="180" x2="100" y2="240" stroke="#36291d" stroke-width="1.5"/>
      <line x1="10" y1="300" x2="115" y2="330" stroke="#36291d" stroke-width="1.5"/>
      <line x1="380" y1="180" x2="300" y2="240" stroke="#2e2216" stroke-width="1.5"/>
      <!-- 벽에 달린 주철 가스등 브라켓 -->
      <path d="M120 220 L150 200 L150 225" stroke="#000" stroke-width="4" fill="none"/>
      <polygon points="142,225 158,225 154,205 146,205" fill="#ffeaa7" stroke="#000" stroke-width="2"/>
      <!-- 골목 끝 먼 안개 실루엣 -->
      <rect x="180" y="220" width="40" height="40" fill="#30271c"/>
      <!-- 바닥 젖은 빛 반사 -->
      <ellipse cx="200" cy="380" rx="40" ry="8" fill="#ffeaa7" opacity="0.25"/>
      <ellipse cx="210" cy="460" rx="70" ry="12" fill="#ffeaa7" opacity="0.18"/>
    </svg>
  `,

  'l-museum': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" width="100%" height="100%">
      <defs>
        <radialGradient id="museum-glow" cx="50%" cy="30%" r="60%">
          <stop offset="0%" stop-color="#74b9ff" stop-opacity="0.7"/>
          <stop offset="50%" stop-color="#0984e3" stop-opacity="0.2"/>
          <stop offset="100%" stop-color="#000" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="400" height="600" fill="#08101e"/>
      <circle cx="200" cy="180" r="180" fill="url(#museum-glow)"/>
      <!-- 대리석 기둥들 -->
      <rect x="40" y="80" width="36" height="420" fill="#1b2a47"/>
      <polygon points="30,80 86,80 76,105 40,105" fill="#2d426d"/>
      <rect x="324" y="80" width="36" height="420" fill="#1b2a47"/>
      <polygon points="314,80 370,80 360,105 324,105" fill="#2d426d"/>
      <!-- 중앙 유리 진열장 -->
      <rect x="130" y="260" width="140" height="150" fill="#102038" stroke="#3498db" stroke-width="2"/>
      <rect x="120" y="410" width="160" height="90" fill="#182030"/>
      <!-- 진열장 안의 고대 황금 조각상 / 가면 -->
      <polygon points="200,285 220,320 212,365 188,365 180,320" fill="#f1c40f" stroke="#d4ac0d" stroke-width="2"/>
      <circle cx="200" cy="310" r="6" fill="#e67e22"/>
      <!-- 바닥 체커보드 대리석 타일 -->
      <polygon points="0,500 400,500 400,600 0,600" fill="#0c1424"/>
      <polygon points="0,500 80,500 120,600 0,600" fill="#17233c"/>
      <polygon points="200,500 280,500 360,600 240,600" fill="#17233c"/>
    </svg>
  `,

  'l-ballroom': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" width="100%" height="100%">
      <defs>
        <radialGradient id="ballroom-glow" cx="50%" cy="22%" r="55%">
          <stop offset="0%" stop-color="#fff" stop-opacity="0.95"/>
          <stop offset="35%" stop-color="#fdfbf7" stop-opacity="0.6"/>
          <stop offset="70%" stop-color="#d4af37" stop-opacity="0.25"/>
          <stop offset="100%" stop-color="#111" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="400" height="600" fill="#121016"/>
      <circle cx="200" cy="130" r="180" fill="url(#ballroom-glow)"/>
      <!-- 웅장한 크리스털 샹들리에 -->
      <line x1="200" y1="0" x2="200" y2="70" stroke="#d4af37" stroke-width="3"/>
      <path d="M140 90 Q200 130 260 90 Q200 110 140 90 Z" fill="#d4af37"/>
      <path d="M160 120 Q200 160 240 120 Q200 140 160 120 Z" fill="#d4af37"/>
      <circle cx="200" cy="180" r="6" fill="#fff"/>
      <circle cx="150" cy="95" r="4" fill="#fff"/>
      <circle cx="250" cy="95" r="4" fill="#fff"/>
      <circle cx="170" cy="125" r="4" fill="#fff"/>
      <circle cx="230" cy="125" r="4" fill="#fff"/>
      <!-- 양쪽 붉은 벨벳 드레이프 커튼 -->
      <path d="M0 0 Q60 150 20 380 L0 380 Z" fill="#781d28"/>
      <path d="M400 0 Q340 150 380 380 L400 380 Z" fill="#781d28"/>
      <!-- 아치형 대형 창문 -->
      <path d="M120 360 L120 180 Q200 120 280 180 L280 360 Z" fill="none" stroke="#d4af37" stroke-width="3"/>
      <!-- 반짝이는 무도회장 마루 바닥 원근 -->
      <polygon points="0,420 400,420 400,600 0,600" fill="#321f14"/>
      <line x1="200" y1="420" x2="200" y2="600" stroke="#4a2e1d" stroke-width="2"/>
      <line x1="200" y1="420" x2="80" y2="600" stroke="#4a2e1d" stroke-width="2"/>
      <line x1="200" y1="420" x2="320" y2="600" stroke="#4a2e1d" stroke-width="2"/>
    </svg>
  `,

  'l-greenhouse': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" width="100%" height="100%">
      <defs>
        <radialGradient id="gh-glow" cx="50%" cy="30%" r="60%">
          <stop offset="0%" stop-color="#55efc4" stop-opacity="0.5"/>
          <stop offset="50%" stop-color="#00b894" stop-opacity="0.2"/>
          <stop offset="100%" stop-color="#000" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="400" height="600" fill="#0d1814"/>
      <circle cx="200" cy="180" r="180" fill="url(#gh-glow)"/>
      <!-- 빅토리아 철제 온실 아치 프레임 -->
      <path d="M50 400 L50 220 Q200 60 350 220 L350 400" fill="none" stroke="#2d4a3e" stroke-width="5"/>
      <line x1="200" y1="60" x2="200" y2="400" stroke="#2d4a3e" stroke-width="3"/>
      <line x1="120" y1="120" x2="120" y2="400" stroke="#2d4a3e" stroke-width="2"/>
      <line x1="280" y1="120" x2="280" y2="400" stroke="#2d4a3e" stroke-width="2"/>
      <!-- 무성한 열대 식물 잎사귀 실루엣 -->
      <path d="M20 520 Q80 380 140 460 Q60 480 20 520 Z" fill="#1b4d3e"/>
      <path d="M380 500 Q300 360 250 440 Q330 460 380 500 Z" fill="#163e32"/>
      <path d="M120 560 Q200 420 260 500 Q180 520 120 560 Z" fill="#205c4a"/>
      <!-- 걸려있는 식물 온실 랜턴 -->
      <line x1="200" y1="60" x2="200" y2="180" stroke="#2d4a3e" stroke-width="2"/>
      <polygon points="190,195 210,195 205,180 195,180" fill="#ffeaa7" stroke="#000" stroke-width="2"/>
      <ellipse cx="200" cy="200" r="12" fill="#ffeaa7" opacity="0.4"/>
    </svg>
  `,

  'l-cellar': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" width="100%" height="100%">
      <defs>
        <radialGradient id="cellar-glow" cx="68%" cy="46%" r="35%">
          <stop offset="0%" stop-color="#ff7675" stop-opacity="0.8"/>
          <stop offset="40%" cy="46%" stop-color="#fdcb6e" stop-opacity="0.35"/>
          <stop offset="100%" stop-color="#fdcb6e" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="400" height="600" fill="#0c0c0e"/>
      <circle cx="270" cy="280" r="150" fill="url(#cellar-glow)"/>
      <!-- 아치형 석조 지하실 벽면 -->
      <path d="M40 500 L40 220 Q200 120 360 220 L360 500" fill="none" stroke="#26262b" stroke-width="18"/>
      <!-- 벽돌 패턴 텍스처 -->
      <line x1="70" y1="240" x2="150" y2="240" stroke="#1d1d21" stroke-width="3"/>
      <line x1="250" y1="240" x2="330" y2="240" stroke="#1d1d21" stroke-width="3"/>
      <!-- 커다란 오크통 2개 -->
      <ellipse cx="120" cy="400" rx="45" ry="60" fill="#3a281c"/>
      <ellipse cx="120" cy="400" rx="35" ry="50" fill="#291c13"/>
      <line x1="120" y1="340" x2="120" y2="460" stroke="#150e09" stroke-width="2"/>
      <!-- 탁자 위의 촛대 -->
      <rect x="220" y="320" width="100" height="180" fill="#241913"/>
      <rect x="266" y="275" width="8" height="35" fill="#f5f6fa"/>
      <ellipse cx="270" cy="265" rx="4" ry="8" fill="#ffeaa7"/>
      <circle cx="270" cy="266" r="2" fill="#d63031"/>
    </svg>
  `,

  // ── 흉기 (Weapons) ──
  'w-poison': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" width="100%" height="100%">
      <defs>
        <radialGradient id="poison-glow" cx="50%" cy="45%" r="45%">
          <stop offset="0%" stop-color="#a29bfe" stop-opacity="0.8"/>
          <stop offset="50%" stop-color="#6c5ce7" stop-opacity="0.3"/>
          <stop offset="100%" stop-color="#000" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="400" height="600" fill="#0d0a18"/>
      <circle cx="200" cy="270" r="160" fill="url(#poison-glow)"/>
      <!-- 어두운 벨벳 테이블 -->
      <polygon points="0,380 400,380 400,600 0,600" fill="#140f24"/>
      <!-- 독약 유리병 몸통 -->
      <path d="M160 210 L240 210 L240 240 L275 300 L275 420 Q200 450 125 420 L125 300 L160 240 Z" fill="#2d1b4e" stroke="#9b59b6" stroke-width="3"/>
      <!-- 유리병 안의 보라색/녹색 액체 -->
      <path d="M130 320 Q200 310 270 320 L270 415 Q200 440 130 415 Z" fill="#8e44ad" opacity="0.85"/>
      <!-- 병마개 코르크 -->
      <rect x="175" y="170" width="50" height="40" rx="3" fill="#b07d4b"/>
      <!-- 해골 마크 라벨 -->
      <rect x="165" y="335" width="70" height="60" rx="4" fill="#f5ecd8"/>
      <circle cx="200" cy="355" r="12" fill="#2d1b4e"/>
      <rect x="194" y="367" width="12" height="8" fill="#2d1b4e"/>
      <circle cx="196" cy="354" r="3" fill="#f5ecd8"/>
      <circle cx="204" cy="354" r="3" fill="#f5ecd8"/>
    </svg>
  `,

  'w-bomb': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" width="100%" height="100%">
      <defs>
        <radialGradient id="bomb-spark" cx="62%" cy="22%" r="25%">
          <stop offset="0%" stop-color="#fff" stop-opacity="1"/>
          <stop offset="30%" stop-color="#ffeaa7" stop-opacity="0.9"/>
          <stop offset="70%" stop-color="#e84393" stop-opacity="0.4"/>
          <stop offset="100%" stop-color="#000" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="400" height="600" fill="#140a10"/>
      <circle cx="250" cy="130" r="90" fill="url(#bomb-spark)"/>
      <!-- 붉은 벨벳 테이블보 -->
      <polygon points="0,410 400,410 400,600 0,600" fill="#220d18"/>
      <!-- 구형 철제 폭탄 -->
      <circle cx="190" cy="360" r="95" fill="#1a141a" stroke="#4a3040" stroke-width="4"/>
      <!-- 하이라이트 광택 -->
      <ellipse cx="160" cy="320" rx="35" ry="20" fill="#fff" opacity="0.15" transform="rotate(-30 160 320)"/>
      <!-- 폭탄 목 캡 -->
      <rect x="175" y="245" width="30" height="25" rx="3" fill="#4a3040"/>
      <!-- 타오르는 도화선 (S자 곡선) -->
      <path d="M190 245 Q210 200 220 180 T250 130" fill="none" stroke="#e17055" stroke-width="5"/>
      <!-- 불꽃 파티클 -->
      <polygon points="250,115 255,130 270,130 258,140 262,155 250,145 238,155 242,140 230,130 245,130" fill="#ffeaa7"/>
    </svg>
  `,

  'w-rifle': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" width="100%" height="100%">
      <defs>
        <radialGradient id="rifle-glow" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stop-color="#2ecc71" stop-opacity="0.4"/>
          <stop offset="100%" stop-color="#000" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="400" height="600" fill="#08140e"/>
      <circle cx="200" cy="240" r="160" fill="url(#rifle-glow)"/>
      <!-- 벨벳 천 배경 -->
      <polygon points="0,390 400,390 400,600 0,600" fill="#0d2417"/>
      <!-- 대각선 배치된 장총 -->
      <g transform="rotate(-35 200 300)">
        <!-- 총열 (강철 긴 배럴) -->
        <rect x="20" y="285" width="340" height="12" fill="#2d3436" stroke="#636e72" stroke-width="1"/>
        <!-- 목재 개머리판 -->
        <path d="M260 285 L390 280 L400 330 L320 320 L260 297 Z" fill="#5c3826" stroke="#3d2214" stroke-width="2"/>
        <!-- 방아쇠와 공이치기 -->
        <path d="M240 297 Q245 320 230 320" fill="none" stroke="#b2bec3" stroke-width="3"/>
        <circle cx="240" cy="305" r="8" fill="none" stroke="#b2bec3" stroke-width="2"/>
        <!-- 스코프 조준경 -->
        <rect x="140" y="268" width="110" height="14" fill="#1e272e" stroke="#d4af37" stroke-width="1.5"/>
      </g>
    </svg>
  `,

  'w-pistol': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" width="100%" height="100%">
      <defs>
        <radialGradient id="pistol-glow" cx="50%" cy="40%" r="45%">
          <stop offset="0%" stop-color="#fdcb6e" stop-opacity="0.6"/>
          <stop offset="100%" stop-color="#000" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="400" height="600" fill="#141108"/>
      <circle cx="200" cy="240" r="150" fill="url(#pistol-glow)"/>
      <!-- 테이블 천 -->
      <polygon points="0,400 400,400 400,600 0,600" fill="#201a0d"/>
      <!-- 엔틱 플린트락/리볼버 권총 -->
      <g transform="rotate(-15 200 300)">
        <!-- 총열 (황동 조각 문양) -->
        <rect x="60" y="260" width="180" height="24" rx="3" fill="#2d3436" stroke="#d4af37" stroke-width="2"/>
        <rect x="50" y="258" width="15" height="28" fill="#d4af37"/>
        <!-- 실린더 탄창 -->
        <rect x="220" y="250" width="45" height="42" rx="4" fill="#3d4447" stroke="#2d3436" stroke-width="2"/>
        <!-- 목재 손잡이 그립 -->
        <path d="M260 270 Q310 280 320 370 Q285 390 260 360 Q265 310 250 292 Z" fill="#6d4229" stroke="#3b2012" stroke-width="2"/>
        <!-- 방아쇠 -->
        <path d="M220 295 Q235 320 210 320" fill="none" stroke="#d4af37" stroke-width="3"/>
        <circle cx="218" cy="308" r="10" fill="none" stroke="#d4af37" stroke-width="2"/>
      </g>
    </svg>
  `,

  'w-dagger': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" width="100%" height="100%">
      <defs>
        <radialGradient id="dagger-glow" cx="50%" cy="35%" r="45%">
          <stop offset="0%" stop-color="#74b9ff" stop-opacity="0.8"/>
          <stop offset="50%" stop-color="#0984e3" stop-opacity="0.3"/>
          <stop offset="100%" stop-color="#000" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="400" height="600" fill="#080f18"/>
      <circle cx="200" cy="220" r="160" fill="url(#dagger-glow)"/>
      <polygon points="0,410 400,410 400,600 0,600" fill="#0e1b2d"/>
      <!-- 대각선 배치된 은빛 단검 -->
      <g transform="rotate(35 200 300)">
        <!-- 날카로운 양날 검신 -->
        <polygon points="200,80 185,270 215,270" fill="#dfe6e9" stroke="#b2bec3" stroke-width="2"/>
        <line x1="200" y1="80" x2="200" y2="270" stroke="#74b9ff" stroke-width="1.5"/>
        <!-- 황동 가드 (코등이) -->
        <rect x="150" y="270" width="100" height="14" rx="4" fill="#d4af37" stroke="#aa820a" stroke-width="2"/>
        <!-- 가죽 감긴 손잡이 -->
        <rect x="190" y="284" width="20" height="70" fill="#2d3436"/>
        <line x1="190" y1="298" x2="210" y2="298" stroke="#d4af37" stroke-width="2"/>
        <line x1="190" y1="318" x2="210" y2="318" stroke="#d4af37" stroke-width="2"/>
        <line x1="190" y1="338" x2="210" y2="338" stroke="#d4af37" stroke-width="2"/>
        <!-- 폼멜 (손잡이 끝 보석) -->
        <circle cx="200" cy="370" r="16" fill="#d4af37"/>
        <circle cx="200" cy="370" r="9" fill="#0984e3"/>
      </g>
    </svg>
  `,

  'w-axe': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" width="100%" height="100%">
      <defs>
        <radialGradient id="axe-glow" cx="50%" cy="30%" r="50%">
          <stop offset="0%" stop-color="#e67e22" stop-opacity="0.6"/>
          <stop offset="100%" stop-color="#000" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="400" height="600" fill="#140d08"/>
      <circle cx="200" cy="200" r="160" fill="url(#axe-glow)"/>
      <polygon points="0,420 400,420 400,600 0,600" fill="#22140b"/>
      <!-- 대각선 묵직한 도끼 -->
      <g transform="rotate(-30 200 320)">
        <!-- 긴 목재 자루 -->
        <rect x="190" y="100" width="22" height="380" rx="6" fill="#795548" stroke="#4e342e" stroke-width="2"/>
        <!-- 강철 도끼날 헤드 -->
        <path d="M180 130 L110 90 Q80 160 110 230 L180 190 Z" fill="#b0bec5" stroke="#78909c" stroke-width="3"/>
        <path d="M100 110 Q80 160 100 210" stroke="#fff" stroke-width="2" fill="none"/>
        <rect x="180" y="145" width="42" height="30" fill="#546e7a"/>
      </g>
    </svg>
  `,

  'w-rope': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" width="100%" height="100%">
      <defs>
        <radialGradient id="rope-glow" cx="50%" cy="40%" r="45%">
          <stop offset="0%" stop-color="#f5f6fa" stop-opacity="0.6"/>
          <stop offset="100%" stop-color="#000" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="400" height="600" fill="#101012"/>
      <circle cx="200" cy="250" r="160" fill="url(#rope-glow)"/>
      <!-- 목재 보 / 들보 -->
      <rect x="0" y="40" width="400" height="40" fill="#2c1d11" stroke="#180f08" stroke-width="2"/>
      <!-- 매달린 밧줄 올가미 노끈 -->
      <line x1="200" y1="80" x2="200" y2="220" stroke="#c7a77b" stroke-width="12" stroke-dasharray="8 3"/>
      <!-- 매듭 -->
      <rect x="184" y="220" width="32" height="50" rx="6" fill="#a48153" stroke="#725530" stroke-width="3"/>
      <!-- 올가미 루프 -->
      <ellipse cx="200" cy="360" rx="65" ry="90" fill="none" stroke="#c7a77b" stroke-width="14" stroke-dasharray="10 4"/>
      <!-- 늘어진 밧줄 꼬리 -->
      <path d="M210 270 Q240 330 220 380" fill="none" stroke="#c7a77b" stroke-width="8"/>
    </svg>
  `,

  'w-wrench': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" width="100%" height="100%">
      <defs>
        <radialGradient id="wrench-glow" cx="50%" cy="40%" r="45%">
          <stop offset="0%" stop-color="#a1887f" stop-opacity="0.65"/>
          <stop offset="100%" stop-color="#000" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="400" height="600" fill="#120e0c"/>
      <circle cx="200" cy="250" r="160" fill="url(#wrench-glow)"/>
      <polygon points="0,410 400,410 400,600 0,600" fill="#1f1612"/>
      <!-- 대각선 주철 대형 렌치/스패너 -->
      <g transform="rotate(-40 200 300)">
        <!-- 렌치 손잡이 바디 -->
        <rect x="184" y="140" width="32" height="300" rx="6" fill="#5d4037" stroke="#3e2723" stroke-width="3"/>
        <!-- 헤드 조 (Open End) -->
        <path d="M160 140 C140 100 170 60 200 60 C230 60 260 100 240 140 Z" fill="#8d6e63" stroke="#4e342e" stroke-width="3"/>
        <polygon points="180,60 220,60 210,110 190,110" fill="#120e0c"/>
        <!-- 하단 링 헤드 -->
        <circle cx="200" cy="440" r="30" fill="#8d6e63" stroke="#4e342e" stroke-width="3"/>
        <circle cx="200" cy="440" r="15" fill="#120e0c"/>
      </g>
    </svg>
  `,

  'w-club': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" width="100%" height="100%">
      <defs>
        <radialGradient id="club-glow" cx="50%" cy="35%" r="45%">
          <stop offset="0%" stop-color="#b2bec3" stop-opacity="0.6"/>
          <stop offset="100%" stop-color="#000" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="400" height="600" fill="#0e0f12"/>
      <circle cx="200" cy="230" r="160" fill="url(#club-glow)"/>
      <polygon points="0,420 400,420 400,600 0,600" fill="#1a1c22"/>
      <!-- 대각선 영국 런던 경찰 곤봉/오크 몽둥이 -->
      <g transform="rotate(40 200 310)">
        <!-- 몽둥이 두꺼운 헤드부터 손잡이까지 -->
        <path d="M175 100 Q170 240 188 380 L212 380 Q230 240 225 100 Q200 80 175 100 Z" fill="#3e2723" stroke="#271610" stroke-width="3"/>
        <!-- 헤드 금속 밴드 -->
        <rect x="176" y="140" width="48" height="12" fill="#78909c"/>
        <rect x="178" y="190" width="44" height="12" fill="#78909c"/>
        <!-- 손잡이 가죽 그립 끈 -->
        <rect x="187" y="380" width="26" height="60" rx="3" fill="#212121"/>
        <path d="M200 440 Q240 480 200 520 Q160 480 200 440" fill="none" stroke="#5d4037" stroke-width="5"/>
      </g>
    </svg>
  `,
};

/** 카드 ID에 해당하는 SVG 데이터 URL 가져오기 */
export function getCardSvgDataUrl(cardId: string): string | null {
  const svg = CARD_SVG_ART[cardId];
  if (!svg) return null;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;
}
