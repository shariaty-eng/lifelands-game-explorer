"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ApiResponse, Game, PaginatedGames } from "@/types/game";

interface UseGamesQueryResult {
  games: Game[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  total: number;
  hasMore: boolean;
  loadMore: () => void;
  reset: () => void;
  currentPage: number;
}

const FIRST_PAGE = 1;

export function useGamesQuery(initial: PaginatedGames): UseGamesQueryResult {
  const [games, setGames] = useState<Game[]>(initial.games);
  const [total, setTotal] = useState<number>(initial.total);
  const [currentPage, setCurrentPage] = useState<number>(initial.pageId);
  const [eachPerPage, setEachPerPage] = useState<number>(initial.eachPerPage);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  const hasMore = currentPage * eachPerPage < total;

  const fetchPage = useCallback(async (pageId: number, append: boolean) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoadingMore(true);
    setError(null);

    try {
      const res = await fetch(`/api/games?pageId=${pageId}`, {
        signal: controller.signal,
      });
      if (!res.ok) {
        throw new Error(`خطا در دریافت بازی‌ها (${res.status})`);
      }
      const json = (await res.json()) as ApiResponse<PaginatedGames>;
      if (!json.state) {
        throw new Error("پاسخ نامعتبر از سرور");
      }

      const page = json.data;

      setGames((prev) => {
        if (!append) return page.games;
        const seen = new Set(prev.map((game) => game._id));
        const uniqueNewGames = page.games.filter((game) => {
          if (seen.has(game._id)) return false;
          seen.add(game._id);
          return true;
        });
        return [...prev, ...uniqueNewGames];
      });

      setEachPerPage(page.eachPerPage);
      setTotal(page.total);
      setCurrentPage(page.pageId);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return;
      }
      setError(err instanceof Error ? err.message : "خطای ناشناخته");
    } finally {
      if (abortRef.current === controller) {
        setIsLoadingMore(false);
      }
    }
  }, []);

  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore) return;
    void fetchPage(currentPage + 1, true);
  }, [currentPage, hasMore, isLoadingMore, fetchPage]);

  const reset = useCallback(() => {
    setGames([]);
    setCurrentPage(FIRST_PAGE);
    setError(null);
  }, []);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  return {
    games,
    isLoading: false,
    isLoadingMore,
    error,
    total,
    hasMore,
    loadMore,
    reset,
    currentPage,
  };
}
