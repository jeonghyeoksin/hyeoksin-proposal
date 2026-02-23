import { GoogleGenAI, Type } from "@google/genai";
import { ProposalInput } from "../types";

// Helper to initialize AI
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateProposalText = async (input: ProposalInput): Promise<string> => {
  const ai = getAI();
  const prompt = `
    당신은 세계 최고의 비즈니스 제안서 컨설턴트이자 전문 웹 퍼블리셔입니다.
    당신의 임무는 [참고 내용]을 **100% 완벽하게 분석하고 하나도 빠짐없이 활용**하여, 클라이언트가 거절할 수 없는 혁신적이고 매력적인 제안서를 작성하는 것입니다.

    [핵심 제약 사항: 마크다운 사용 금지]
    - **절대로 마크다운(**, ##, -, *, 등)을 사용하지 마십시오.** 문자가 그대로 출력되면 안 됩니다.
    - 결과물은 **오직 순수 HTML 코드**로만 작성되어야 합니다. (<html>, <body> 태그 제외, <div>로 감싼 내용만 출력)

    [디자인 및 스타일 가이드]
    인라인 CSS (style="")를 적극 사용하여 문서를 시각적으로 화려하고 전문적으로 만드십시오.
    1. **전체 테마**: Deep Blue (#1e3a8a) & Emerald (#059669) & Dark Grey (#334155).
    2. **본문 텍스트**: 가독성 높은 #334155 색상, 줄간격 1.8.
    3. **강조(Highlight)**: 핵심 키워드나 숫자는 반드시 <span style="background-color: #fef9c3; color: #854d0e; padding: 2px 4px; border-radius: 4px; font-weight: bold;">노란색 배경 하이라이트</span> 처리.
    4. **핵심 문장**: 문단 내 중요한 문장은 <strong style="color: #2563eb;">파란색 굵은 글씨</strong>로 처리.
    5. **소제목**: <h3> 태그 사용. <h3 style="color: #1e40af; border-left: 5px solid #1e40af; padding-left: 12px; margin-top: 30px; margin-bottom: 15px; font-size: 18px;">스타일 적용.
    6. **리스트**: <ul>, <li> 태그 사용. <li>는 <li style="margin-bottom: 8px;"> 적용.

    [작성 원칙]
    1. **참고 내용 100% 활용**: [참고 내용]에 포함된 모든 수치, 고유명사, 전략, 세부 사항을 제안서 본문에 **그대로 녹여내십시오**. 요약하지 말고 상세하게 풀어서 서술하십시오. 분량은 무제한입니다.
    2. **테이블 필수**: '견적 및 예산안' 섹션은 반드시 HTML <table> 태그를 사용하여 작성하십시오.
       - Table Style: <table style="width: 100%; border-collapse: collapse; margin: 20px 0; border: 1px solid #cbd5e1;">
       - Th Style: <th style="background-color: #f1f5f9; color: #1e293b; padding: 12px; border: 1px solid #cbd5e1;">
       - Td Style: <td style="padding: 12px; border: 1px solid #cbd5e1; text-align: center; color: #475569;">

    [입력 정보]
    - 제안 업체: ${input.myCompanyName}
    - 클라이언트: ${input.clientCompanyName}
    - 산업 분야: ${input.clientIndustry}
    - 제안서 유형: ${input.proposalType}
    - 핵심 목표(Objective): ${input.objective}
    
    [참고 내용 (이 내용을 100% 반영할 것)]
    ${input.referenceContent}

    [제안서 HTML 구조 (<h1>, <h2> 순서 준수)]
    <div style="font-family: 'Malgun Gothic', sans-serif; line-height: 1.8; color: #334155;">
      
      <h1 style="color: #111827; border-bottom: 4px solid #2563eb; padding-bottom: 15px; margin-top: 50px; font-size: 28px;">1. 제안 배경 및 목적</h1>
      <p>시장 상황과 클라이언트의 니즈 통찰...</p>

      <h1 style="color: #111827; border-bottom: 4px solid #2563eb; padding-bottom: 15px; margin-top: 50px; font-size: 28px;">2. 현황 분석 및 시사점</h1>
      <p>[참고 내용] 상세 분석...</p>

      <h1 style="color: #111827; border-bottom: 4px solid #2563eb; padding-bottom: 15px; margin-top: 50px; font-size: 28px;">3. 핵심 전략 및 솔루션</h1>
      ...

      <h1 style="color: #111827; border-bottom: 4px solid #2563eb; padding-bottom: 15px; margin-top: 50px; font-size: 28px;">4. 세부 실행 방안</h1>
      ...

      <h1 style="color: #111827; border-bottom: 4px solid #2563eb; padding-bottom: 15px; margin-top: 50px; font-size: 28px;">5. 기대 효과</h1>
      ...

      <h1 style="color: #111827; border-bottom: 4px solid #2563eb; padding-bottom: 15px; margin-top: 50px; font-size: 28px;">6. 견적 및 예산안</h1>
      <!-- 테이블로 작성 -->

    </div>
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      temperature: 0.6, // Slightly lower for more structured following
      thinkingConfig: { thinkingBudget: 4096 }
    }
  });

  return response.text || "";
};

export const generateInfographicPrompts = async (text: string): Promise<string[]> => {
  const ai = getAI();
  const prompt = `
    다음 HTML 텍스트를 분석하여, 텍스트의 핵심 내용을 시각적으로 설명할 수 있는 인포그래픽 아이디어 3개를 도출하세요.
    
    [텍스트]
    ${text.substring(0, 6000)}

    [요청사항]
    JSON 배열 포맷으로 출력하세요. 각 항목은 인포그래픽을 묘사하는 구체적인 프롬프트여야 합니다.
    인포그래픽 이미지 안에 포함될 한국어 텍스트 키워드(단어 1~2개)를 반드시 포함해서 묘사하세요.
    
    예시:
    [
      "상승하는 화살표가 있는 3D 바 차트, 파란색과 흰색 테마, '매출 급증'이라는 한글 텍스트가 차트 위에 적혀있음, 깔끔한 비즈니스 스타일, 고화질 렌더링",
      "중앙에 전구 아이콘이 있고 주변에 톱니바퀴가 맞물려 돌아가는 프로세스 다이어그램, '혁신 솔루션'이라는 한글 텍스트 포함, 현대적인 플랫 디자인"
    ]
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
        }
    }
  });

  try {
    const jsonStr = response.text || "[]";
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("Failed to parse infographic prompts", e);
    return [];
  }
};

export const generateImage = async (imagePrompt: string, isCover: boolean = false): Promise<string | null> => {
  const ai = getAI();
  // Use pro model for better text rendering
  const model = 'gemini-3-pro-image-preview'; 

  const enhancedPrompt = isCover 
    ? `A professional business proposal cover image (vertical 3:4 aspect ratio). ${imagePrompt}. High quality, corporate aesthetic, photorealistic or high-end 3D render, minimal text, elegant design.`
    : `A clean, modern infographic chart or diagram. ${imagePrompt}. White background, professional business color palette (blue, navy, grey, teal). The text in the image must be legible. High resolution.`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: enhancedPrompt,
      config: {
        imageConfig: {
            aspectRatio: isCover ? "3:4" : "16:9",
            imageSize: "1K" 
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return part.inlineData.data;
      }
    }
    return null;
  } catch (error) {
    console.error("Image generation error:", error);
    return null;
  }
};