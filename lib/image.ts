import type { Game } from "@/types/game";

const IMAGE_BASE_URL = "https://lifelands.ir/";

export function resolveImageUrl(image: string): string {
  if (!image) return "";
  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }
  return new URL(image, IMAGE_BASE_URL).toString();
}

export function primaryImageFor(game: Pick<Game, "image">): string {
  return resolveImageUrl(game.image);
}

export function cardDimensions(isLandscape: boolean): {
  width: number;
  height: number;
} {
  return isLandscape
    ? { width: 400, height: 225 } // 16:9
    : { width: 300, height: 400 }; // 3:4
}
