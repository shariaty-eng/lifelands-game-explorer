"use client";

import type { SortKey } from "@/types/game";
import { FILTER_CONFIG } from "@/lib/filter-config";
import { SearchInput } from "./SearchInput";
import { SortSelect } from "./SortSelect";

const VENDOR_LABELS: Record<string, string> = {
  soroush: "سروش",
  rubika: "روبیکا",
  __unspecified__: "نامشخص",
};

const VENDOR_CONFIG = FILTER_CONFIG.find((f) => f.id === "vendors");
const CATEGORY_CONFIG = FILTER_CONFIG.find((f) => f.id === "category");

interface FilterBarProps {
  query: string;
  onQueryChange: (v: string) => void;
  selectedVendors: string[];
  onToggleVendor: (v: string) => void;
  showUnspecified: boolean;
  selectedCategory: string;
  onCategoryChange: (v: string) => void;
  categories: string[];
  favoritesOnly: boolean;
  onFavoritesOnlyChange: (v: boolean) => void;
  landscapeOnly: boolean;
  onLandscapeOnlyChange: (v: boolean) => void;
  sortKey: SortKey;
  onSortKeyChange: (v: SortKey) => void;
  sortDir: "asc" | "desc";
  onSortDirChange: (v: "asc" | "desc") => void;
}

export function FilterBar({
  query,
  onQueryChange,
  selectedVendors,
  onToggleVendor,
  showUnspecified,
  selectedCategory,
  onCategoryChange,
  categories,
  favoritesOnly,
  onFavoritesOnlyChange,
  landscapeOnly,
  onLandscapeOnlyChange,
  sortKey,
  onSortKeyChange,
  sortDir,
  onSortDirChange,
}: FilterBarProps) {
  const vendorOptions =
    VENDOR_CONFIG && VENDOR_CONFIG.kind === "multi-select"
      ? VENDOR_CONFIG.options
      : [];

  return (
    <div
      className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5"
      role="search"
      aria-label="فیلتر و جستجوی بازی‌ها"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <SearchInput value={query} onChange={onQueryChange} />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SortSelect
            sortKey={sortKey}
            onSortKeyChange={onSortKeyChange}
            sortDir={sortDir}
            onSortDirChange={onSortDirChange}
          />
          <label className="flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50">
            <input
              type="checkbox"
              checked={favoritesOnly}
              onChange={(e) => onFavoritesOnlyChange(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span>فقط علاقه‌مندی‌ها</span>
          </label>
          {FILTER_CONFIG.some((f) => f.id === "landscape") && (
            <label className="flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50">
              <input
                type="checkbox"
                checked={landscapeOnly}
                onChange={(e) => onLandscapeOnlyChange(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>افقی</span>
            </label>
          )}
        </div>
      </div>

      {vendorOptions.length > 0 && (
        <fieldset>
          <legend className="mb-2 text-sm font-medium text-gray-700">
            {VENDOR_CONFIG?.label ?? "پلتفرم"}
          </legend>
          <div className="flex flex-wrap gap-2">
            {vendorOptions.map((vendor) => {
              const checked = selectedVendors.includes(vendor);
              return (
                <button
                  key={vendor}
                  type="button"
                  onClick={() => onToggleVendor(vendor)}
                  aria-pressed={checked}
                  className={`rounded-full border px-3 py-1.5 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                    checked
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {VENDOR_LABELS[vendor] ?? vendor}
                </button>
              );
            })}
            {showUnspecified && (
              <button
                type="button"
                onClick={() => onToggleVendor("__unspecified__")}
                aria-pressed={selectedVendors.includes("__unspecified__")}
                className={`rounded-full border px-3 py-1.5 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 ${
                  selectedVendors.includes("__unspecified__")
                    ? "border-amber-600 bg-amber-600 text-white"
                    : "border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100"
                }`}
              >
                نامشخص
              </button>
            )}
          </div>
        </fieldset>
      )}

      {CATEGORY_CONFIG && (
        <fieldset>
          <legend className="mb-2 text-sm font-medium text-gray-700">
            {CATEGORY_CONFIG.label}
          </legend>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onCategoryChange("")}
              aria-pressed={selectedCategory === ""}
              className={`rounded-full border px-3 py-1.5 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                selectedCategory === ""
                  ? "border-gray-900 bg-gray-900 text-white"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              همه
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() =>
                  onCategoryChange(cat === selectedCategory ? "" : cat)
                }
                aria-pressed={selectedCategory === cat}
                className={`rounded-full border px-3 py-1.5 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                  selectedCategory === cat
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                {cat.trim()}
              </button>
            ))}
          </div>
        </fieldset>
      )}
    </div>
  );
}
