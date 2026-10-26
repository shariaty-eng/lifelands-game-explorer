"use client";

import { useId } from "react";

interface SearchInputProps {
  value: string;
  onChange: (v: string) => void;
}

export function SearchInput({ value, onChange }: SearchInputProps) {
  const id = useId();

  return (
    <div className="relative">
      <label htmlFor={id} className="sr-only">
        جستجوی بازی
      </label>
      <svg
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        id={id}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="جستجو در نام بازی یا شرکت..."
        className="w-full rounded-lg border border-gray-300 py-2.5 pr-10 pl-3 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        autoComplete="off"
      />
    </div>
  );
}
