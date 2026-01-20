import Replicate from "replicate";
import { translateToEnglish } from "./translate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// FileOutput 타입 정의 (Replicate SDK)
interface FileOutput {
  url(): Promise<string>;
  blob(): Promise<Blob>;
}

function isFileOutput(obj: unknown): obj is FileOutput {
  return (
    obj !== null &&
    typeof obj === "object" &&
    "url" in obj &&
    typeof (obj as FileOutput).url === "function"
  );
}

export async function generateSketch(prompt: string): Promise<string> {
  // 1. 한글 프롬프트를 영어로 번역
  const translatedPrompt = await translateToEnglish(prompt);
  console.log("Original prompt:", prompt);
  console.log("Translated prompt:", translatedPrompt);

  // 2. 영어 스타일 프롬프트 템플릿 적용
  const styledPrompt = `${translatedPrompt}, highly detailed ink line art, vintage storybook illustration style, meticulous cross-hatching for shading, cream-colored paper background, clean outlines, whimsical atmosphere, monochromatic with warm tones.`;

  console.log("Generating sketch with prompt:", styledPrompt);

  const output = await replicate.run("black-forest-labs/flux-schnell", {
    input: {
      prompt: styledPrompt,
      num_outputs: 1,
      aspect_ratio: "1:1",
      output_format: "png",
    },
  });

  // 디버깅: output의 실제 구조 확인
  console.log("Replicate output type:", typeof output);
  console.log("Replicate output is array:", Array.isArray(output));
  if (Array.isArray(output) && output.length > 0) {
    const firstItem = output[0];
    console.log("First item type:", typeof firstItem);
    console.log("First item constructor:", firstItem?.constructor?.name);
    console.log("First item keys:", firstItem ? Object.keys(firstItem) : "N/A");
    console.log("First item toString:", String(firstItem));
  }

  // output 형식 처리
  let imageUrl: string | null = null;

  if (Array.isArray(output) && output.length > 0) {
    const firstItem = output[0];

    // 1. FileOutput 객체인 경우 (url() 메서드 호출)
    if (isFileOutput(firstItem)) {
      console.log("Detected FileOutput object, calling url()...");
      imageUrl = await firstItem.url();
    }
    // 2. 문자열인 경우
    else if (typeof firstItem === "string") {
      imageUrl = firstItem;
    }
    // 3. URL 속성을 가진 객체인 경우
    else if (firstItem && typeof firstItem === "object" && "url" in firstItem) {
      const urlProp = (firstItem as { url: unknown }).url;
      if (typeof urlProp === "string") {
        imageUrl = urlProp;
      }
    }
    // 4. toString()으로 URL 추출 시도
    else if (firstItem && typeof firstItem.toString === "function") {
      const strValue = String(firstItem);
      if (strValue.startsWith("http")) {
        imageUrl = strValue;
      }
    }
  }
  // 단일 문자열인 경우
  else if (typeof output === "string") {
    imageUrl = output;
  }
  // 단일 FileOutput인 경우
  else if (isFileOutput(output)) {
    imageUrl = await output.url();
  }

  console.log("Extracted imageUrl:", imageUrl);

  if (!imageUrl) {
    console.error("Failed to extract image URL. Raw output:", output);
    throw new Error("이미지 생성에 실패했습니다. 출력 형식을 확인해주세요.");
  }

  return imageUrl;
}
