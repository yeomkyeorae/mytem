"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import type { Item } from "@/types/database.types";

// API에서 categories JOIN한 결과를 포함한 아이템 타입
interface ItemWithCategory extends Item {
  categories?: {
    id: string;
    name: string;
  } | null;
}

interface ItemCardProps {
  item: ItemWithCategory;
}

export default function ItemCard({ item }: ItemCardProps) {
  // image_url이 SVG 문자열인 경우 처리
  const renderImage = () => {
    if (!item.image_url) {
      // 기본 아이콘 (이미지가 없는 경우)
      return (
        <svg
          className="w-3/4 h-3/4 text-white/30"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18M9 21V9" />
        </svg>
      );
    }

    // SVG 문자열인 경우 (스케치)
    if (item.image_url.trim().startsWith("<svg")) {
      return (
        <div
          className="w-full h-full flex items-center justify-center [&_svg]:w-full [&_svg]:h-full [&_svg]:text-white"
          dangerouslySetInnerHTML={{ __html: item.image_url }}
        />
      );
    }

    // URL인 경우 img 태그 사용
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={item.image_url}
        alt={item.name}
        className="w-full h-full object-contain"
      />
    );
  };

  return (
    <Link href={`/items/${item.id}`}>
      <Card className="p-4 bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer group">
        {/* 스케치 이미지 */}
        <div className="w-full aspect-square flex items-center justify-center bg-white/5 rounded-lg mb-3 group-hover:bg-white/10 transition-colors">
          {renderImage()}
        </div>

        {/* 이름 */}
        <h3 className="font-medium text-white truncate mb-1">{item.name}</h3>

        {/* 개수 및 카테고리 */}
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-white/50">{item.quantity}개</p>
          {item.categories && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/60">
              {item.categories.name}
            </span>
          )}
        </div>
      </Card>
    </Link>
  );
}
