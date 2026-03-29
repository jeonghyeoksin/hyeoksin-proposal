import { GoogleGenAI, Type } from "@google/genai";
import { ProposalInput } from "../types";

// Helper to initialize AI
const getAI = () => {
  // 1. Check for custom key in localStorage (for deployed web environment)
  const customKey = typeof window !== 'undefined' ? localStorage.getItem('custom_gemini_api_key') : null;
  
  // 2. Use custom key if available, otherwise fallback to environment key (which is updated by AI Studio's openSelectKey)
  const apiKey = customKey || process.env.API_KEY || process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error("API Key가 설정되지 않았습니다. 상단에서 API Key를 입력하거나 이미지 생성 권한 설정을 완료해주세요.");
  }
  
  return new GoogleGenAI({ apiKey });
};

export const generateProposalPlan = async (input: {
  myCompanyName: string;
  clientCompanyName: string;
  clientIndustry: string;
  proposalType: string;
  clientCurrentSituation?: string;
  monthlyBudget?: string;
  proposedService?: string;
  mustIncludeContent?: string;
}): Promise<{ objective: string; plan: string }> => {
  const ai = getAI();
  const prompt = `
    당신은 제안서 기획 전문가입니다. 
    다음 정보를 바탕으로 클라이언트가 제안서를 보고 즉시 계약하고 싶게 만드는 '후킹성 있고 매력적인' 핵심 목표와 제안서 기획(목차 및 핵심 전략)을 작성해주세요.

    [중요 지침]
    - 만약 '제안할 서비스'가 입력되었다면, **반드시 해당 서비스에 특화된** 제안서 기획과 목표를 수립해야 합니다. 다른 서비스로 분산되지 않도록 주의하십시오.
    - '꼭 작성해야 될 내용'이 있다면, 이를 기획안의 핵심 전략이나 목차에 자연스럽게 녹여내십시오.

    [입력 정보]
    - 내 업체명: ${input.myCompanyName}
    - 클라이언트 업체명: ${input.clientCompanyName}
    - 클라이언트 산업 분야: ${input.clientIndustry}
    - 제안서 종류: ${input.proposalType}
    - 제안할 서비스: ${input.proposedService || '정보 없음'}
    - 클라이언트 현재 상황: ${input.clientCurrentSituation || '정보 없음'}
    - 월 예산: ${input.monthlyBudget || '정보 없음'}
    - 꼭 작성해야 될 내용: ${input.mustIncludeContent || '정보 없음'}

    [출력 형식]
    JSON 객체로 출력하세요.
    {
      "objective": "한 문장으로 된 강력한 핵심 목표 (예: 3개월 내 매출 300% 성장을 위한 초격차 마케팅 전략)",
      "plan": "제안서의 전체적인 흐름과 핵심 전략을 포함한 기획안 (불렛 포인트 등으로 상세히 작성)"
    }
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          objective: { type: Type.STRING },
          plan: { type: Type.STRING }
        },
        required: ["objective", "plan"]
      }
    }
  });

  try {
    const jsonStr = response.text || "{}";
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("Failed to parse proposal plan", e);
    return { objective: "", plan: "" };
  }
};

export const generateProposalText = async (input: ProposalInput): Promise<string> => {
  const ai = getAI();
  const prompt = `
    당신은 세계 최고의 비즈니스 제안서 컨설턴트이자 전문 웹 퍼블리셔입니다.
    당신의 임무는 [참고 내용]을 **최대한 분석하고 활용**하여, 클라이언트가 거절할 수 없는 혁신적이고 매력적인 제안서를 작성하는 것입니다.
    만약 [참고 내용]이 비어있다면, [핵심 목표]와 [제안서 기획]을 바탕으로 당신의 전문성을 발휘하여 최상의 제안서를 작성하십시오.

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
    1. **서비스 집중**: 만약 [제안할 서비스]가 명시되어 있다면, 제안서의 모든 내용은 **해당 서비스의 강점, 실행 방안, 기대 효과**에 집중되어야 합니다.
    2. **참고 내용 및 기획안 활용**: [참고 내용]과 [제안서 기획]에 포함된 모든 수치, 고유명사, 전략, 세부 사항을 제안서 본문에 **그대로 녹여내십시오**. 요약하지 말고 상세하게 풀어서 서술하십시오. 분량은 무제한입니다.
    3. **필수 포함 내용 준수**: [꼭 작성해야 될 내용]이 있다면, 해당 내용을 제안서의 적절한 위치에 **반드시, 누락 없이** 포함시키십시오. 이는 클라이언트의 핵심 요구사항이므로 매우 중요합니다.
    4. **테이블 필수**: '견적 및 예산안' 섹션은 반드시 HTML <table> 태그를 사용하여 작성하십시오.
       - Table Style: <table style="width: 100%; border-collapse: collapse; margin: 20px 0; border: 1px solid #cbd5e1;">
       - Th Style: <th style="background-color: #f1f5f9; color: #1e293b; padding: 12px; border: 1px solid #cbd5e1;">
       - Td Style: <td style="padding: 12px; border: 1px solid #cbd5e1; text-align: center; color: #475569;">

    9. **가격 제안 필수**: '견적 및 예산안' 섹션에서는 제안하는 서비스의 **시장 평균 가격을 고려하여 현실적이고 납득 가능한 가격**을 제시하십시오. 
       - 단순히 총액만 적지 말고, 항목별(예: 기획비, 개발비, 운영비 등)로 상세히 나누어 테이블로 작성하십시오.
       - 통화 단위는 '원(KRW)'을 사용하십시오.

    [입력 정보]
    - 제안 업체: ${input.myCompanyName}
    - 클라이언트: ${input.clientCompanyName}
    - 산업 분야: ${input.clientIndustry}
    - 제안서 유형: ${input.proposalType}
    - 제안할 서비스: ${input.proposedService || '정보 없음'}
    - 클라이언트 현재 상황: ${input.clientCurrentSituation || '정보 없음'}
    - 월 예산: ${input.monthlyBudget || '정보 없음'}
    - 꼭 작성해야 될 내용: ${input.mustIncludeContent || '정보 없음'}
    - 핵심 목표(Objective): ${input.objective}
    - 제안서 기획(Plan): ${input.proposalPlan}
    
    [참고 내용]
    ${input.referenceContent}

    [제안서 HTML 구조 (<h1>, <h2> 순서 준수)]
    <div style="font-family: 'Malgun Gothic', sans-serif; line-height: 1.8; color: #334155;">
      
      <h1 style="color: #111827; border-bottom: 4px solid #2563eb; padding-bottom: 15px; margin-top: 50px; font-size: 28px;">1. 제안 배경 및 목적</h1>
      <p>시장 상황과 클라이언트의 니즈 통찰...</p>

      <h1 style="color: #111827; border-bottom: 4px solid #2563eb; padding-bottom: 15px; margin-top: 50px; font-size: 28px;">2. 제안서 기획 및 핵심 전략</h1>
      <p>[제안서 기획(Plan)] 내용을 바탕으로 수립된 전략적 방향성...</p>

      <h1 style="color: #111827; border-bottom: 4px solid #2563eb; padding-bottom: 15px; margin-top: 50px; font-size: 28px;">3. 현황 분석 및 시사점</h1>
      <p>상세 분석...</p>

      <h1 style="color: #111827; border-bottom: 4px solid #2563eb; padding-bottom: 15px; margin-top: 50px; font-size: 28px;">4. 핵심 솔루션 및 실행 방안</h1>
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

export const generateImage = async (imagePrompt: string, isCover: boolean = false, referenceImageBase64?: string | null): Promise<string | null> => {
  const ai = getAI();
  // Use gemini-3.1-flash-image-preview for high quality and Korean text support
  const model = 'gemini-3.1-flash-image-preview'; 

  const enhancedPrompt = isCover 
    ? `A professional business proposal cover image (vertical 3:4 aspect ratio). ${imagePrompt}. High quality, corporate aesthetic, photorealistic or high-end 3D render, minimal text, elegant design. Ensure any Korean text is rendered perfectly without corruption.`
    : `A clean, modern infographic chart or diagram. ${imagePrompt}. White background, professional business color palette (blue, navy, grey, teal). The text in the image must be legible and in Korean if specified. High resolution. Ensure any Korean text is rendered perfectly without corruption.`;

  try {
    const contents: any = {
      parts: [{ text: enhancedPrompt }]
    };

    if (referenceImageBase64) {
      // Remove data URL prefix if present
      const base64Data = referenceImageBase64.includes(',') 
        ? referenceImageBase64.split(',')[1] 
        : referenceImageBase64;
        
      contents.parts.push({
        inlineData: {
          data: base64Data,
          mimeType: "image/png"
        }
      });
      if (isCover) {
        contents.parts[0].text += " Use the provided image as the main visual theme for the cover.";
      }
    }

    const response = await ai.models.generateContent({
      model: model,
      contents: contents,
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