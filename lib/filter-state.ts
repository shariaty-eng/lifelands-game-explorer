import type { SortKey } from "@/types/game";

const SORT_KEYS: readonly SortKey[] = [
  "quality",
  "score",
  "rating",
  "level",
  "like",
  "seenCount",
  "runCount",
];

export function isSortKey(value: string | null): value is SortKey {
  if (value === null) return false;
  return (SORT_KEYS as readonly string[]).includes(value);
}

export type FilterMode =
  | { mode: "search"; query: string }
  | { mode: "sort"; sortKey: SortKey; direction: "asc" | "desc" };

export function parseFilterMode(params: URLSearchParams): FilterMode {
  const query = params.get("q")?.trim() ?? "";
  if (query.length > 0) {
    return { mode: "search", query };
  }
  const rawSort = params.get("sort");
  const rawDirection = params.get("dir");
  return {
    mode: "sort",
    sortKey: isSortKey(rawSort) ? rawSort : "quality",
    direction: rawDirection === "asc" ? "asc" : "desc",
  };
}
