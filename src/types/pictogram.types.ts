// Iconify API 응답 타입
export interface IconifyIcon {
  prefix: string; // 예: "mdi", "heroicons"
  name: string; // 예: "account", "home"
  body: string; // SVG body
  width?: number;
  height?: number;
}

export interface IconifySearchResult {
  icons: string[]; // 예: ["mdi:account", "mdi:account-box"]
  total: number;
  limit: number;
  start: number;
}

export interface IconifyCollectionInfo {
  prefix: string;
  name: string;
  total: number;
  author: {
    name: string;
    url?: string;
  };
  license: {
    title: string;
    spdx?: string;
    url?: string;
  };
  samples: string[];
  height?: number | number[];
  category?: string;
  palette?: boolean;
}

// 우리 앱에서 사용할 픽토그램 타입
export interface Pictogram {
  id: string; // 예: "mdi:account"
  name: string; // 표시 이름
  svg: string; // SVG 전체 코드
  keywords: string[]; // 검색 키워드
  category?: string; // 카테고리
  collection: string; // 컬렉션 이름 (Material Design Icons, Heroicons 등)
}

// 픽토그램 카테고리
export enum PictogramCategory {
  CLOTHING = "clothing", // 의류
  ELECTRONICS = "electronics", // 전자기기
  ACCESSORIES = "accessories", // 액세서리
  HOUSEHOLD = "household", // 생활용품
  SPORTS = "sports", // 스포츠
  BOOKS = "books", // 도서
  OTHERS = "others", // 기타
}
