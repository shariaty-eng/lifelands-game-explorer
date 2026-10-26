import type { Game } from "@/types/game";

const MAX_LIKE = 1000;

function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0;
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

function normScore(score: number): number {
  return clamp01(score / 5);
}

function normRating(rating: number): number {
  return clamp01(rating);
}

function normLike(like: number): number {
  if (like <= 0) return 0;
  return clamp01(Math.log10(1 + like) / Math.log10(1 + MAX_LIKE));
}

export function qualityScore(game: Game): number {
  return (
    0.5 * normScore(game.score) +
    0.3 * normRating(game.rating) +
    0.2 * normLike(game.like)
  );
}
