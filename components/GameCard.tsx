"use client";

import Image from "next/image";
import { memo, useState } from "react";
import type { Game } from "@/types/game";
import { resolveImageUrl, cardDimensions } from "@/lib/image";

interface GameCardProps {
  game: Game;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

export const GameCard = memo(function GameCard({
  game,
  isFavorite,
  onToggleFavorite,
}: GameCardProps) {
  const [imgError, setImgError] = useState(false);
  const { width, height } = cardDimensions(game.isLandscape);
  const imageUrl = resolveImageUrl(game.image);

  return (
    <article
      className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
      role="listitem"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
        {imgError || !imageUrl ? (
          <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400">
            <svg
              className="h-12 w-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="sr-only">تصویر موجود نیست</span>
          </div>
        ) : (
          <Image
            src={imageUrl}
            alt={game.title}
            width={width}
            height={height}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            onError={() => setImgError(true)}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
          />
        )}
        <button
          type="button"
          onClick={() => onToggleFavorite(game._id)}
          aria-label={
            isFavorite
              ? `حذف ${game.title} از علاقه‌مندی‌ها`
              : `افزودن ${game.title} به علاقه‌مندی‌ها`
          }
          aria-pressed={isFavorite}
          className="absolute left-2 top-2 rounded-full bg-white/90 p-2 shadow-sm backdrop-blur transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <svg
            className={`h-5 w-5 ${isFavorite ? "fill-red-500 text-red-500" : "fill-none text-gray-600"}`}
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>
      </div>

      <div className="space-y-2 p-4">
        <h2
          className="line-clamp-1 text-base font-bold text-gray-900"
          title={game.title}
        >
          {game.title}
        </h2>
        <p className="line-clamp-1 text-sm text-gray-500">{game.companyName}</p>
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
            {game.category.title.trim()}
          </span>
          <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
            امتیاز {game.score.toLocaleString("fa-IR")}
          </span>
        </div>
      </div>
    </article>
  );
});
