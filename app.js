const USERS = [
  { id: "admin", password: "2026", role: "admin", name: "관리자" },
  { id: "10101", password: "1234", role: "student", studentId: "10101" },
  { id: "10102", password: "1234", role: "student", studentId: "10102" },
  { id: "10103", password: "1234", role: "student", studentId: "10103" },
];

const STUDENTS = [
  {
    id: "10101",
    name: "김코딩",
    alias: "학생 A",
    photo: "assets/10101_김코딩.jpg",
    grades: {
      "정보 수행평가": "A",
      "웹앱 프로젝트": "92점",
      "디지털 윤리 퀴즈": "88점",
      "수업 참여도": "상",
    },
    traits: [
      "문제 해결 과정을 차분히 설명합니다.",
      "새 도구를 시도할 때 기록을 꼼꼼히 남깁니다.",
      "제출 전 확인 습관을 더 연습하면 좋습니다.",
    ],
    teacherMemo: "프론트엔드 구조 이해가 빠르며, 팀원 질문에 답하는 태도가 좋습니다.",
  },
  {
    id: "10102",
    name: "박개발",
    alias: "학생 B",
    photo: "assets/10102_박개발.jpg",
    grades: {
      "정보 수행평가": "B+",
      "웹앱 프로젝트": "86점",
      "디지털 윤리 퀴즈": "91점",
      "수업 참여도": "중상",
    },
    traits: [
      "협업 중 역할 분담을 잘 지킵니다.",
      "UI 수정 아이디어를 자주 제안합니다.",
      "프로젝트 범위를 작게 나누는 연습이 필요합니다.",
    ],
    teacherMemo: "기능 구현 의욕이 높고, 오류가 날 때 원인을 함께 추적하려는 태도가 좋습니다.",
  },
  {
    id: "10103",
    name: "이교사",
    alias: "학생 C",
    photo: "assets/10103_이교사.jpg",
    grades: {
      "정보 수행평가": "A-",
      "웹앱 프로젝트": "89점",
      "디지털 윤리 퀴즈": "95점",
      "수업 참여도": "상",
    },
    traits: [
      "학습 내용을 자기 언어로 정리합니다.",
      "개선할 지점을 발견하면 근거를 함께 제시합니다.",
      "코드 주석을 더 구체적으로 쓰면 좋습니다.",
    ],
    teacherMemo: "질문의 초점이 좋고, 개선 방향을 토의하는 데 적극적입니다.",
  },
];

const loginForm = document.querySelector("#loginForm");
const userIdInput = document.querySelector("#userId");
const passwordInput = document.querySelector("#password");
const loginMessage = document.querySelector("#loginMessage");
const logoutButton = document.querySelector("#logoutButton");
const loginView = document.querySelector("#loginView");
const studentView = document.querySelector("#studentView");
const adminView = document.querySelector("#adminView");

let currentUser = null;
let selectedCounselingStudentId = null;

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const id = userIdInput.value.trim();
  const password = passwordInput.value;
  const user = USERS.find((item) => item.id === id && item.password === password);

  if (!user) {
    loginMessage.textContent = "아이디 또는 비밀번호가 올바르지 않습니다.";
    passwordInput.value = "";
    passwordInput.focus();
    return;
  }

  currentUser = user;
  loginMessage.textContent = "";
  loginForm.reset();

  if (user.role === "admin") {
    renderAdminDashboard();
  } else {
    const student = STUDENTS.find((item) => item.id === user.studentId);
    renderStudentPage(student);
  }
});

logoutButton.addEventListener("click", () => {
  currentUser = null;
  selectedCounselingStudentId = null;
  showOnly(loginView);
  logoutButton.classList.add("hidden");
  userIdInput.focus();
});

function showOnly(targetView) {
  [loginView, studentView, adminView].forEach((view) => view.classList.add("hidden"));
  targetView.classList.remove("hidden");
}

function renderStudentPage(student) {
  if (!student) {
    loginMessage.textContent = "학생 정보를 찾을 수 없습니다.";
    showOnly(loginView);
    return;
  }

  studentView.innerHTML = `
    <div class="view-header">
      <div class="view-title">
        <p class="eyebrow">Student</p>
        <h2>${student.name} 학생 페이지</h2>
        <p>로그인한 학생의 학습 현황을 확인합니다.</p>
      </div>
    </div>

    <div class="student-layout">
      <article class="student-profile">
        <img class="student-photo" src="${student.photo}" alt="${student.name} 학생 사진" />
        <div class="profile-body">
          <h3>${student.name}</h3>
          <p class="student-number">학번 ${student.id}</p>
          <div class="tag-row" aria-label="학습 키워드">
            <span class="tag">정보</span>
            <span class="tag">프로젝트</span>
          </div>
        </div>
      </article>

      <div class="content-stack">
        ${renderGrades(student.grades, false, `gradesTitle-${student.id}`)}
        ${renderTraits(student)}
      </div>
    </div>
  `;

  showOnly(studentView);
  logoutButton.classList.remove("hidden");
}

function renderAdminDashboard() {
  adminView.innerHTML = `
    <div class="view-header">
      <div class="view-title">
        <p class="eyebrow">Admin</p>
        <h2>관리자 대시보드</h2>
        <p>학생 3명의 학습 현황을 한 화면에서 비교합니다.</p>
      </div>
    </div>

    <section class="admin-grid" aria-label="전체 학생 정보">
      ${STUDENTS.map(renderStudentCard).join("")}
    </section>

    <div id="counselingPanelContainer" class="counseling-panel-wrapper">
      ${renderCounselingPanel()}
    </div>
  `;

  showOnly(adminView);
  logoutButton.classList.remove("hidden");
  attachCounselingEvents();
}

function renderStudentCard(student) {
  return `
    <article class="student-card">
      <img class="student-photo" src="${student.photo}" alt="${student.name} 학생 사진" />
      <div class="student-card-body">
        <h3>${student.name}</h3>
        <p class="student-number">학번 ${student.id}</p>
        ${renderGrades(student.grades, true, `gradesTitle-${student.id}`)}
        ${renderTraits(student)}
        <button class="primary-button" style="width:100%; margin-top: 16px;" onclick="selectStudentForCounseling('${student.id}')">상담 전략 요청</button>
      </div>
    </article>
  `;
}

window.selectStudentForCounseling = function(id) {
  selectedCounselingStudentId = id;
  const container = document.getElementById("counselingPanelContainer");
  if (container) {
    container.innerHTML = renderCounselingPanel();
    attachCounselingEvents();
    container.scrollIntoView({ behavior: 'smooth' });
  }
};

function renderCounselingPanel() {
  if (!selectedCounselingStudentId) {
    return `
      <section class="counseling-panel empty">
        <p style="text-align:center; padding:40px; color:var(--muted);">학생 카드의 "상담 전략 요청" 버튼을 눌러주세요.</p>
      </section>
    `;
  }

  const student = STUDENTS.find(s => s.id === selectedCounselingStudentId);
  const gradeSummary = Object.entries(student.grades).map(([k, v]) => `${k}: ${v}`).join(", ");
  const learningTraits = student.traits.join(" ") + " " + student.teacherMemo;
  
  const sampleData = {
    studentAlias: student.alias,
    gradeSummary,
    learningTraits,
    teacherConcern: "여기에 작성한 고민 내용이 들어갑니다."
  };

  return `
    <section class="counseling-panel">
      <h3>🤖 AI 학생 상담 전략 도우미</h3>
      <div class="counseling-student-info">
        <strong>선택된 학생:</strong> ${student.name} (${student.id}) <br/>
        <small style="color: var(--muted);">※ Gemini 전송용 익명화 이름: ${student.alias}</small>
      </div>

      <div class="counseling-form">
        <label for="teacherConcernInput">교사 고민 입력</label>
        <textarea id="teacherConcernInput" class="counseling-textarea" rows="3" placeholder="예) 수업 참여는 좋은데 평가 결과가 낮습니다. 어떻게 상담하면 좋을까요?"></textarea>
      </div>

      <div class="preview-area">
        <p><strong>전송 데이터 미리보기 (개인정보 무포함)</strong></p>
        <pre id="previewJson">${JSON.stringify(sampleData, null, 2)}</pre>
      </div>

      <button id="requestCounselingBtn" class="primary-button">AI 상담 전략 받기</button>

      <div id="counselingResultArea" class="counseling-result hidden"></div>

      <p class="disclaimer">
        AI 상담 전략은 참고용입니다. 최종 판단과 실제 상담은 교사가 학생의 상황을 종합적으로 고려하여 진행해야 합니다.
      </p>
    </section>
  `;
}

function attachCounselingEvents() {
  const concernInput = document.getElementById("teacherConcernInput");
  const previewJson = document.getElementById("previewJson");
  const requestBtn = document.getElementById("requestCounselingBtn");
  const resultArea = document.getElementById("counselingResultArea");

  if (!concernInput || !requestBtn) return;

  const student = STUDENTS.find(s => s.id === selectedCounselingStudentId);
  const gradeSummary = Object.entries(student.grades).map(([k, v]) => `${k}: ${v}`).join(", ");
  const learningTraits = student.traits.join(" ") + " " + student.teacherMemo;

  concernInput.addEventListener("input", (e) => {
    const concern = e.target.value;
    const data = {
      studentAlias: student.alias,
      gradeSummary,
      learningTraits,
      teacherConcern: concern || "여기에 작성한 고민 내용이 들어갑니다."
    };
    previewJson.textContent = JSON.stringify(data, null, 2);
  });

  requestBtn.addEventListener("click", async () => {
    const concern = concernInput.value.trim();
    if (!concern) {
      alert("상담 고민을 먼저 입력해주세요.");
      return;
    }

    resultArea.classList.remove("hidden");
    resultArea.innerHTML = "<p>AI가 상담 전략을 생성하는 중입니다...</p>";
    requestBtn.disabled = true;

    try {
      const data = {
        studentAlias: student.alias,
        gradeSummary,
        learningTraits,
        teacherConcern: concern
      };

      const response = await fetch("/api/gemini-counseling", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        resultArea.innerHTML = `<div class="result-content">${escapeHtml(result.result).replace(/\\n/g, "<br>")}</div>`;
      } else {
        resultArea.innerHTML = `<p class="error-text">AI 상담 전략을 불러오지 못했습니다. API 키 또는 Vercel 환경 변수를 확인해주세요. (${result.error || ''})</p>`;
      }
    } catch (error) {
      resultArea.innerHTML = `<p class="error-text">AI 상담 전략을 불러오지 못했습니다. API 키 또는 Vercel 환경 변수를 확인해주세요.</p>`;
    } finally {
      requestBtn.disabled = false;
    }
  });
}

function escapeHtml(unsafe) {
  return unsafe
       .replace(/&/g, "&amp;")
       .replace(/</g, "&lt;")
       .replace(/>/g, "&gt;")
       .replace(/"/g, "&quot;")
       .replace(/'/g, "&#039;");
}

function renderGrades(grades, compact = false, headingId = "gradesTitle") {
  const rows = Object.entries(grades)
    .map(([label, value]) => `<tr><th scope="row">${label}</th><td>${value}</td></tr>`)
    .join("");

  return `
    <section aria-labelledby="${headingId}">
      <div class="section-title">
        <h3 id="${headingId}">성적 정보</h3>
      </div>
      <table class="grade-table ${compact ? "compact-table" : ""}">
        <tbody>${rows}</tbody>
      </table>
    </section>
  `;
}

function renderTraits(student) {
  return `
    <section aria-labelledby="traitsTitle-${student.id}">
      <div class="section-title">
        <h3 id="traitsTitle-${student.id}">학습 특성 및 교사 메모</h3>
      </div>
      <ul class="memo-list">
        ${student.traits.map((trait) => `<li>${trait}</li>`).join("")}
        <li>${student.teacherMemo}</li>
      </ul>
    </section>
  `;
}

showOnly(loginView);
