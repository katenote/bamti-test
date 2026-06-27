// 프론트엔드에 API 키를 넣으면 개발자 도구에서 노출될 수 있습니다.
// Gemini API 호출은 Vercel Serverless Function에서 안전하게 처리합니다.
// Vercel 배포 시에는 Project Settings의 Environment Variables에 GEMINI_API_KEY를 등록해야 합니다.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const { studentAlias, gradeSummary, learningTraits, teacherConcern } = req.body;

  if (!studentAlias || !gradeSummary || !learningTraits || !teacherConcern) {
    return res.status(400).json({ success: false, error: "필수 데이터가 누락되었습니다." });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ success: false, error: "GEMINI_API_KEY 환경 변수가 설정되지 않았습니다." });
  }

  const systemPrompt = `당신은 교사를 돕는 AI 학생 상담 전략 도우미입니다.
학생을 단정적으로 판단하거나 진단하지 마세요. "의지가 부족하다", "주의력 문제가 있다", "심리적 문제가 있다"처럼 단정하는 표현을 피하세요.
상담 전략은 교사가 학생을 이해하고 대화할 수 있도록 돕는 방향이어야 합니다.
답변은 반드시 다음 항목을 포함하는 형식으로 지켜주세요:
1. 현재 상황 요약
2. 학생 데이터 기반 해석
3. 상담 접근 전략
4. 교사가 던질 수 있는 질문 3개
5. 피해야 할 말 또는 주의점
6. 다음 수업에서 해볼 수 있는 작은 지원`;

  const userPrompt = `학생 가명: ${studentAlias}
성적 요약: ${gradeSummary}
학습 특성: ${learningTraits}
교사 고민: ${teacherConcern}`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: { text: systemPrompt } },
        contents: [{ role: "user", parts: [{ text: userPrompt }] }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Gemini API Error:", errorData);
      throw new Error("Gemini API 호출에 실패했습니다.");
    }

    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!resultText) {
      throw new Error("응답 결과를 파싱할 수 없습니다.");
    }

    return res.status(200).json({ success: true, result: resultText });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: error.message || "서버 오류가 발생했습니다." });
  }
}
