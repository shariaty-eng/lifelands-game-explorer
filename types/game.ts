export interface ApiResponse<T> {
  state: boolean;
  data: T;
}

export const SUPPORTED_VENDORS = ["soroush", "rubika"] as const;

export type Vendor = (typeof SUPPORTED_VENDORS)[number];

export function isVendor(value: string): value is Vendor {
  return (SUPPORTED_VENDORS as readonly string[]).includes(value);
}

export interface GameCategoryRef {
  _id: string;
  title: string;
}

export interface GameCategory {
  _id: string;
  title: string;
  categoryId: GameCategoryRef;
}

export interface Game {
  _id: string;
  title: string;
  description?: string;
  image: string;
  companyName: string;
  category: GameCategory;
  score: number;
  rating: number;
  level: number;
  like: number;
  seenCount: number;
  runCount: number;
  vitrinThirdPartyVendors: string[];
  isLandscape: boolean;
  createdAtIso: string;
  updatedAtIso: string;
}

export interface PaginatedGames {
  pageId: number;
  eachPerPage: number;
  searchValue: string;
  total: number;
  games: Game[];
  gamesWithoutConsole?: unknown[];
}

type NumericKeys<T> = {
  [K in keyof T]-?: T[K] extends number ? K : never;
}[keyof T];

export type GameNumericKey = NumericKeys<Game>;

export type SortKey = GameNumericKey | "quality";

export interface SearchMode {
  mode: "search";
  query: string;
}

export interface SortMode {
  mode: "sort";
  sortKey: SortKey;
  direction: "asc" | "desc";
}

export type FilterMode = SearchMode | SortMode;

export type FilterKind = "multi-select" | "single-select" | "range";

export interface FilterConfigBase {
  id: string;
  label: string;
}

export interface MultiSelectFilterConfig extends FilterConfigBase {
  kind: "multi-select";
  options: readonly string[];
}

export interface SingleSelectFilterConfig extends FilterConfigBase {
  kind: "single-select";
  options: readonly string[];
}

export interface RangeFilterConfig extends FilterConfigBase {
  kind: "range";
  min: number;
  max: number;
  step: number;
}

export type FilterConfig =
  | MultiSelectFilterConfig
  | SingleSelectFilterConfig
  | RangeFilterConfig;

export type FavoriteId = Game["_id"];