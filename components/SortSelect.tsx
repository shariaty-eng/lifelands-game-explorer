"use client";

import type { SortKey } from "@/types/game";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "quality", label: "کیفیت ترکیبی" },
  { value: "score", label: "امتیاز" },
  { value: "runCount", label: "تعداد اجرا" },
  { value: "seenCount", label: "تعداد بازدید" },
  { value: "like", label: "لایک" },
];

interface SortSelectProps {
  sortKey: SortKey;
  onSortKeyChange: (v: SortKey) => void;
  sortDir: "asc" | "desc";
  onSortDirChange: (v: "asc" | "desc") => void;
}

export function SortSelect({
  sortKey,
  onSortKeyChange,
  sortDir,
  onSortDirChange,
}: SortSelectProps) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort-select" className="sr-only">
        مرتب‌سازی بر اساس
      </label>
      <select
        id="sort-select"
        value={sortKey}
        onChange={(e) => onSortKeyChange(e.target.value as SortKey)}
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={() => onSortDirChange(sortDir === "desc" ? "asc" : "desc")}
        aria-label={sortDir === "desc" ? "مرتب‌سازی صعودی" : "مرتب‌سازی نزولی"}
        className="rounded-lg border border-gray-300 p-2 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        {sortDir === "desc" ? "↓" : "↑"}
      </button>
    </div>
  );
}
