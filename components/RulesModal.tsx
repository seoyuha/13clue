import Modal from './Modal';

export default function RulesModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal title="📜 13개의 증거 공식 게임 규칙 가이드" onClose={onClose} width={680}>
      <div className="rules">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(90deg, rgba(220, 38, 38, 0.16), rgba(18, 26, 51, 0.6))',
            border: '1px solid rgba(220, 38, 38, 0.45)',
            padding: '10px 14px',
            borderRadius: 10,
            marginBottom: 16,
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#fecaca' }}>
            <span style={{ fontSize: 18 }}>🎬</span>
            <span>영상을 보며 규칙을 배우고 싶으신가요?</span>
          </div>
          <a
            href="https://www.youtube.com/watch?v=jTd5wEva_WE&t=12s"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12,
              fontWeight: 700,
              color: '#ffffff',
              background: '#dc2626',
              padding: '6px 14px',
              borderRadius: 6,
              textDecoration: 'none',
              boxShadow: '0 2px 8px rgba(220, 38, 38, 0.4)',
            }}
          >
            <span>소개 영상 보러가기</span>
            <span>▶</span>
          </a>
        </div>

        <h3>🎯 게임의 목표</h3>
        <p style={{ margin: 0 }}>
          내 가림막 바깥에 꽂힌 <b>나만의 사건 카드 3장(인물 1명, 장소 1곳, 흉기 1개)</b>을 친구들보다 먼저 정확히 맞히면 승리합니다.<br />
          <b>친구들은 내 카드를 볼 수 있지만, 나 자신은 내 정답 카드를 볼 수 없습니다.</b>
        </p>

        <h3>🃏 인원수별 규칙 & 제외 카드 표</h3>
        <table style={{ width: '100%', margin: '12px 0', borderCollapse: 'collapse', textAlign: 'center' }}>
          <thead>
            <tr style={{ background: 'rgba(255, 255, 255, 0.08)' }}>
              <th>인원수</th>
              <th>제외되는 색깔 (완전 제거)</th>
              <th>가림막 바깥</th>
              <th>가림막 안쪽(손패)</th>
              <th>중앙 비밀정보원</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><b>2명</b></td>
              <td>회색, 갈색, 보라, 분홍 (12장)</td>
              <td>3장</td>
              <td>2장 (좌/우)</td>
              <td><b>8장 (A~H)</b></td>
            </tr>
            <tr>
              <td><b>3명</b></td>
              <td>회색, 갈색, 보라 (9장)</td>
              <td>3장</td>
              <td>2장</td>
              <td><b>6장 (A~F)</b></td>
            </tr>
            <tr>
              <td><b>4명</b></td>
              <td>회색, 갈색 (6장)</td>
              <td>3장</td>
              <td>2장</td>
              <td><b>4장 (A~D)</b></td>
            </tr>
            <tr>
              <td><b>5명</b></td>
              <td>회색 (3장)</td>
              <td>3장</td>
              <td>2장</td>
              <td><b>2장 (A~B)</b></td>
            </tr>
            <tr>
              <td><b>6명</b></td>
              <td>없음 (30장 모두 사용)</td>
              <td>3장</td>
              <td>2장</td>
              <td><b>0장 (미사용)</b></td>
            </tr>
          </tbody>
        </table>

        <h3>🔄 진행 순서 및 질문하기</h3>
        <ul>
          <li>내 차례에 맞은편이나 옆 친구 한 명을 지목해 <b>구두(말로) 질문</b>합니다.<br />
            예시: <i>"민우야, 네 눈에 보이는 <b>야외 장소</b> 카드는 총 몇 장이야?"</i><br />
            예시: <i>"지수야, 네 눈에 보이는 <b>보라색 카드</b>는 총 몇 장이니?"</i>
          </li>
          <li>지목받은 친구는 <b>자신이 볼 수 있는 모든 카드</b>(다른 사람들의 가림막 바깥 카드 + 자기 손패 2장)를 세어서 숫자로만 대답합니다.</li>
          <li>답변을 들은 탐정은 우측 <b>[인터랙티브 추리노트]</b>를 터치하여 단서를 소거합니다.<br />
            (터치 시: <b>빈칸 → X(제외) → O(확정) → 빈칸</b> 순환)
          </li>
          <li><b>중앙 비밀정보원</b>: 내 차례에 돋보기 토큰 1개를 소모하여 중앙 알파벳 타일 카드 1장을 비공개로 확인할 수 있습니다. (2인 플레이 시 토큰 없이 확인 가능)</li>
          <li><b>사건 해결(정답 지목)</b>: 내 차례에 내 가림막 카드를 확신한다면 <b>[사건 해결]</b> 버튼을 눌러 인물·장소·흉기를 제출합니다!</li>
        </ul>

        <h3>📱 태블릿 화면 탭 전환 사용법</h3>
        <ul>
          <li><b>🪟 바깥 화면 (친구에게 보여주기)</b>: 태블릿을 책상 위에 세워두어 친구들이 내 카드를 볼 수 있게 합니다. (나는 화면을 가려 보지 않습니다!)</li>
          <li><b>🔒 안쪽 화면 (나만 보기)</b>: 내 손패 2장, 돋보기 토큰, 비밀정보원 열람, 그리고 추리노트를 나 혼자만 보면서 조작합니다.</li>
        </ul>
      </div>

      <div className="modal-foot">
        <button id="rules-close" className="btn btn-gold" onClick={onClose}>
          규칙 확인 완료 🔍
        </button>
      </div>
    </Modal>
  );
}
