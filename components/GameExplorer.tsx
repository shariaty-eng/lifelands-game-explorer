"use client";

import { useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import type { PaginatedGames, SortKey } from "@/types/game";
import {
  filterGames,
  sortGames,
  collectCategories,
  hasUnspecifiedVendors,
} from "@/lib/filter";
import { parseFilterMode } from "@/lib/filter-state";
import { useDebounce } from "@/hooks/useDebounce";
import { useUrlState, useUrlStateBatch } from "@/hooks/useUrlState";
import { useFavorites } from "@/hooks/useFavorites";
import { useGamesQuery } from "@/hooks/useGamesQuery";
import { GameCard } from "./GameCard";
import { FilterBar } from "./FilterBar";
import { EmptyState } from "./EmptyState";
import { LoadMoreButton } from "./LoadMoreButton";

const DEFAULT_QUERY = "";
const DEFAULT_VENDORS: string[] = [];
const DEFAULT_CATEGORY = "";
const DEFAULT_SORT: SortKey = "quality";
const DEFAULT_DIR = "desc";
const DEFAULT_FAV = "";

interface GameExplorerProps {
  initialData: PaginatedGames;
}

export function GameExplorer({ initialData }: GameExplorerProps) {
  const searchParams = useSearchParams();

  const [queryRaw, setQueryRaw] = useUrlState("q", DEFAULT_QUERY);
  const [vendorsRaw, setVendorsRaw] = useUrlState("vendors", DEFAULT_VENDORS);
  const [categoryRaw, setCategoryRaw] = useUrlState(
    "category",
    DEFAULT_CATEGORY,
  );
  const [favoritesOnlyRaw, setFavoritesOnlyRaw] = useUrlState(
    "fav",
    DEFAULT_FAV,
  );
  const [landscapeRaw, setLandscapeRaw] = useUrlState("landscape", "");

  const updateUrlStates = useUrlStateBatch();

  const parsedMode = useMemo(
    () => parseFilterMode(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );

  const sortKey: SortKey =
    parsedMode.mode === "sort" ? parsedMode.sortKey : DEFAULT_SORT;
  const sortDir: "asc" | "desc" =
    parsedMode.mode === "sort" ? parsedMode.direction : DEFAULT_DIR;

  const query = typeof queryRaw === "string" ? queryRaw : "";
  const selectedVendors = Array.isArray(vendorsRaw) ? vendorsRaw : [];
  const selectedCategory = typeof categoryRaw === "string" ? categoryRaw : "";
  const favoritesOnly = favoritesOnlyRaw === "1";
  const landscapeOnly = landscapeRaw === "1";

  const debouncedQuery = useDebounce(query, 300);
  const { favorites, toggle } = useFavorites();

  const {
    games: allGames,
    isLoadingMore,
    error,
    total,
    hasMore,
    loadMore,
    currentPage,
  } = useGamesQuery(initialData);

  const categories = useMemo(() => collectCategories(allGames), [allGames]);
  const showUnspecified = useMemo(
    () => hasUnspecifiedVendors(allGames),
    [allGames],
  );

  const processedGames = useMemo(() => {
    const filtered = filterGames(allGames, {
      query: debouncedQuery,
      selectedVendors,
      selectedCategory: selectedCategory || undefined,
      favoritesOnly,
      favoriteIds: favorites,
      landscapeOnly,
    });
    return sortGames(filtered, sortKey, sortDir);
  }, [
    allGames,
    debouncedQuery,
    selectedVendors,
    selectedCategory,
    favoritesOnly,
    favorites,
    sortKey,
    sortDir,
    landscapeOnly,
  ]);

  const handleToggleVendor = useCallback(
    (vendor: string) => {
      const next = selectedVendors.includes(vendor)
        ? selectedVendors.filter((v) => v !== vendor)
        : [...selectedVendors, vendor];
      setVendorsRaw(next);
    },
    [selectedVendors, setVendorsRaw],
  );

  const handleSortKeyChange = useCallback(
    (key: SortKey) => {
      updateUrlStates({ sort: key, dir: sortDir });
    },
    [updateUrlStates, sortDir],
  );

  const handleSortDirChange = useCallback(
    (dir: "asc" | "desc") => {
      updateUrlStates({ sort: sortKey, dir });
    },
    [updateUrlStates, sortKey],
  );

  const handleClearFilters = useCallback(() => {
    updateUrlStates({
      q: "",
      vendors: [],
      category: "",
      fav: "",
      sort: "quality",
      dir: "desc",
      landscape: "",
    });
  }, [updateUrlStates]);

  if (error) {
    return (
      <EmptyState variant="error" onAction={() => window.location.reload()} />
    );
  }

  const filterBar = (
    <FilterBar
      query={query}
      onQueryChange={setQueryRaw}
      selectedVendors={selectedVendors}
      onToggleVendor={handleToggleVendor}
      showUnspecified={showUnspecified}
      selectedCategory={selectedCategory}
      onCategoryChange={setCategoryRaw}
      categories={categories}
      favoritesOnly={favoritesOnly}
      onFavoritesOnlyChange={(v) => setFavoritesOnlyRaw(v ? "1" : "")}
      landscapeOnly={landscapeOnly}
      onLandscapeOnlyChange={(v) => setLandscapeRaw(v ? "1" : "")}
      sortKey={sortKey}
      onSortKeyChange={handleSortKeyChange}
      sortDir={sortDir}
      onSortDirChange={handleSortDirChange}
    />
  );

  if (processedGames.length === 0 && !isLoadingMore) {
    return (
      <>
        {filterBar}
        <EmptyState variant="no-results" onAction={handleClearFilters} />
      </>
    );
  }

  return (
    <div className="space-y-6">
      {filterBar}

      <div
        className="flex items-center justify-between text-sm text-gray-500"
        aria-live="polite"
      >
        <span>
          نمایش {processedGames.length.toLocaleString("fa-IR")} بازی از{" "}
          {total.toLocaleString("fa-IR")}
        </span>
        {currentPage > 1 && (
          <span>صفحه {currentPage.toLocaleString("fa-IR")}</span>
        )}
      </div>

      <div
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        role="list"
        aria-label="لیست بازی‌ها"
      >
        {processedGames.map((game) => (
          <GameCard
            key={game._id}
            game={game}
            isFavorite={favorites.has(game._id)}
            onToggleFavorite={toggle}
          />
        ))}
      </div>

      {hasMore && (
        <LoadMoreButton
          onClick={loadMore}
          isLoading={isLoadingMore}
          remaining={Math.max(total - allGames.length, 0)}
        />
      )}
    </div>
  );
}
