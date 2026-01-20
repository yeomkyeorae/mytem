import translate from "google-translate-api-next";

/**
 * 한글 텍스트를 영어로 번역
 * 이미 영어인 경우 그대로 반환
 */
export async function translateToEnglish(text: string): Promise<string> {
  // 한글이 포함되어 있는지 확인
  const hasKorean = /[가-힣]/.test(text);

  if (!hasKorean) {
    return text; // 한글이 없으면 그대로 반환
  }

  try {
    const result = await translate(text, { from: "ko", to: "en" });
    return result.text;
  } catch (error) {
    console.error("Translation error:", error);
    return text; // 번역 실패 시 원본 반환
  }
}
