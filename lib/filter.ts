import type { Game, SortKey } from "@/types/game";
import { isVendor } from "@/types/game";
import { normalizeForMatch } from "./normalize";
import { qualityScore } from "./quality";

export const UNSPECIFIED_VENDOR = "__unspecified__" as const;

export interface FilterOptions {
  query: string;
  selectedVendors: string[];
  selectedCategory?: string;
  minQuality?: number;
  favoritesOnly?: boolean;
  favoriteIds?: ReadonlySet<string>;
  landscapeOnly?: boolean;
}

export function filterGames(
  games: readonly Game[],
  options: FilterOptions,
): Game[] {
  const q = normalizeForMatch(options.query);
  const vendors = options.selectedVendors;
  const hasVendorFilter = vendors.length > 0;
  const wantsUnspecified = vendors.includes(UNSPECIFIED_VENDOR);
  const concreteVendors = vendors.filter(
    (v) => v !== UNSPECIFIED_VENDOR && isVendor(v),
  );

  return games.filter((g) => {
    if (q) {
      const haystack = normalizeForMatch(`${g.title} ${g.companyName}`);
      if (!haystack.includes(q)) return false;
    }

    if (hasVendorFilter) {
      const gameVendors = g.vitrinThirdPartyVendors.filter(isVendor);
      const isEmpty = gameVendors.length === 0;
      if (isEmpty) {
        if (!wantsUnspecified) return false;
      } else {
        const matchesConcrete = gameVendors.some((v) =>
          concreteVendors.includes(v),
        );
        if (!matchesConcrete) return false;
      }
    }

    if (
      options.selectedCategory &&
      g.category.title !== options.selectedCategory
    ) {
      return false;
    }

    if (
      options.minQuality !== undefined &&
      qualityScore(g) < options.minQuality
    ) {
      return false;
    }

    if (options.favoritesOnly) {
      if (!options.favoriteIds || !options.favoriteIds.has(g._id)) return false;
    }

    if (options.landscapeOnly && !g.isLandscape) {
      return false;
    }

    return true;
  });
}

export type SortDirection = "asc" | "desc";

const SORT_ACCESSORS: {
  [K in Exclude<SortKey, "quality">]: (g: Game) => number;
} = {
  score: (g) => g.score,
  rating: (g) => g.rating,
  level: (g) => g.level,
  like: (g) => g.like,
  seenCount: (g) => g.seenCount,
  runCount: (g) => g.runCount,
};

function accessorFor(key: SortKey): (g: Game) => number {
  if (key === "quality") return qualityScore;
  return SORT_ACCESSORS[key];
}

export function sortGames(
  games: readonly Game[],
  key: SortKey,
  direction: SortDirection = "desc",
): Game[] {
  const get = accessorFor(key);
  return [...games].sort((a, b) => {
    const av = get(a);
    const bv = get(b);
    if (av === bv) return 0;
    return direction === "asc" ? av - bv : bv - av;
  });
}

export function collectCategories(games: readonly Game[]): string[] {
  const set = new Set<string>();
  for (const g of games) set.add(g.category.title);
  return [...set].sort();
}

export function hasUnspecifiedVendors(games: readonly Game[]): boolean {
  return games.some(
    (g) => g.vitrinThirdPartyVendors.filter(isVendor).length === 0,
  );
}
