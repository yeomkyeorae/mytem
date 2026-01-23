import type {
  IconifyIcon,
  IconifySearchResult,
  Sketch,
} from "@/types/sketch.types";

const ICONIFY_API_BASE = "https://api.iconify.design";

// 인기 있는 아이콘 컬렉션
export const POPULAR_COLLECTIONS = [
  "mdi", // Material Design Icons
  "heroicons", // Heroicons
  "lucide", // Lucide
  "carbon", // Carbon Design System
  "tabler", // Tabler Icons
];

/**
 * Iconify API에서 아이콘 검색
 * @param query 검색 키워드
 * @param limit 결과 개수 (기본: 20)
 * @returns 아이콘 ID 배열
 */
export async function searchIcons(
  query: string,
  limit: number = 20
): Promise<IconifySearchResult> {
  const params = new URLSearchParams({
    query,
    limit: limit.toString(),
    prefixes: POPULAR_COLLECTIONS.join(","),
  });

  const response = await fetch(`${ICONIFY_API_BASE}/search?${params}`);

  if (!response.ok) {
    throw new Error(`Iconify API error: ${response.statusText}`);
  }

  return response.json();
}

/**
 * 아이콘 ID로 SVG 데이터 가져오기
 * @param iconId 아이콘 ID (예: "mdi:account")
 * @returns 아이콘 데이터
 */
export async function getIconData(iconId: string): Promise<IconifyIcon | null> {
  const [prefix, name] = iconId.split(":");

  if (!prefix || !name) {
    return null;
  }

  const response = await fetch(`${ICONIFY_API_BASE}/${prefix}.json?icons=${name}`);

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  const iconData = data.icons?.[name];

  if (!iconData) {
    return null;
  }

  return {
    prefix,
    name,
    body: iconData.body,
    width: iconData.width || data.width || 24,
    height: iconData.height || data.height || 24,
  };
}

/**
 * 아이콘 데이터를 SVG 문자열로 변환
 * @param icon 아이콘 데이터
 * @returns SVG 문자열
 */
export function iconToSvg(icon: IconifyIcon): string {
  const width = icon.width || 24;
  const height = icon.height || 24;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${icon.body}</svg>`;
}

/**
 * 아이콘 ID로 완전한 스케치 데이터 가져오기
 * @param iconId 아이콘 ID
 * @returns 스케치 데이터
 */
export async function getSketch(iconId: string): Promise<Sketch | null> {
  const iconData = await getIconData(iconId);

  if (!iconData) {
    return null;
  }

  const [prefix, name] = iconId.split(":");
  const svg = iconToSvg(iconData);

  return {
    id: iconId,
    name: name.replace(/-/g, " "), // "account-box" -> "account box"
    svg,
    keywords: name.split("-"),
    collection: getCollectionName(prefix),
  };
}

/**
 * 여러 아이콘 ID를 스케치 데이터로 변환
 * @param iconIds 아이콘 ID 배열
 * @returns 스케치 배열
 */
export async function getSketchs(
  iconIds: string[]
): Promise<Sketch[]> {
  const promises = iconIds.map((id) => getSketch(id));
  const results = await Promise.allSettled(promises);

  return results
    .filter(
      (result): result is PromiseFulfilledResult<Sketch> =>
        result.status === "fulfilled" && result.value !== null
    )
    .map((result) => result.value);
}

/**
 * 컬렉션 prefix를 사람이 읽을 수 있는 이름으로 변환
 */
function getCollectionName(prefix: string): string {
  const names: Record<string, string> = {
    mdi: "Material Design Icons",
    heroicons: "Heroicons",
    lucide: "Lucide",
    carbon: "Carbon Design",
    tabler: "Tabler Icons",
  };

  return names[prefix] || prefix;
}

/**
 * 카테고리별 추천 아이콘 ID
 */
export const RECOMMENDED_ICONS: Record<string, string[]> = {
  clothing: [
    "mdi:tshirt-crew",
    "mdi:shoe-sneaker",
    "mdi:hat-fedora",
    "mdi:sunglasses",
    "heroicons:shopping-bag",
  ],
  electronics: [
    "mdi:laptop",
    "mdi:cellphone",
    "mdi:headphones",
    "mdi:tablet",
    "lucide:smartphone",
  ],
  accessories: [
    "mdi:bag-personal",
    "mdi:watch",
    "mdi:wallet",
    "heroicons:gift",
    "lucide:briefcase",
  ],
  household: [
    "mdi:book-open-page-variant",
    "mdi:cup",
    "mdi:sofa",
    "heroicons:home",
    "lucide:lamp",
  ],
  sports: [
    "mdi:basketball",
    "mdi:soccer",
    "mdi:bike",
    "lucide:dumbbell",
    "heroicons:trophy",
  ],
  books: [
    "mdi:book",
    "mdi:bookshelf",
    "heroicons:book-open",
    "lucide:book-open",
    "carbon:book",
  ],
};
