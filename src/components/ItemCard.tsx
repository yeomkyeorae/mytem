"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import type { Item } from "@/types/database.types";

interface ItemCardProps {
  item: Item;
}

export default function ItemCard({ item }: ItemCardProps) {
  // image_url이 SVG 문자열인 경우 처리
  const renderImage = () => {
    if (!item.image_url) {
      // 기본 아이콘 (이미지가 없는 경우)
      return (
        <svg
          className="w-12 h-12 text-white/30"
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
          className="w-16 h-16 flex items-center justify-center [&_svg]:w-full [&_svg]:h-full [&_svg]:text-white"
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
        className="w-16 h-16 object-contain"
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

        {/* 개수 */}
        <p className="text-sm text-white/50">
          {item.quantity}개
        </p>
      </Card>
    </Link>
  );
}
