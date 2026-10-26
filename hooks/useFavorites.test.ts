// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFavorites } from "./useFavorites";

const STORAGE_KEY = "lifelands:favorites";

describe("useFavorites", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("در ابتدا خالی است", () => {
    const { result } = renderHook(() => useFavorites());
    expect(result.current.favorites.size).toBe(0);
  });

  it("toggle یک آیتم را اضافه می‌کند و در localStorage ذخیره می‌کند", () => {
    const { result } = renderHook(() => useFavorites());
    act(() => {
      result.current.toggle("game-1");
    });
    expect(result.current.favorites.has("game-1")).toBe(true);
    expect(
      JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]"),
    ).toEqual(["game-1"]);
  });

  it("toggle دوباره آیتم را حذف می‌کند", () => {
    const { result } = renderHook(() => useFavorites());
    act(() => {
      result.current.toggle("game-1");
    });
    act(() => {
      result.current.toggle("game-1");
    });
    expect(result.current.favorites.has("game-1")).toBe(false);
  });

  it("در mount، از localStorage می‌خواند", () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(["a", "b"]));
    const { result } = renderHook(() => useFavorites());
    // useEffect بعد از mount اجرا می‌شود
    expect(result.current.favorites.size).toBe(2);
  });

  it("clear همه را حذف می‌کند", () => {
    const { result } = renderHook(() => useFavorites());
    act(() => {
      result.current.toggle("x");
      result.current.toggle("y");
    });
    act(() => {
      result.current.clear();
    });
    expect(result.current.favorites.size).toBe(0);
  });

  it("داده خراب در localStorage را نادیده می‌گیرد", () => {
    window.localStorage.setItem(STORAGE_KEY, "not-json");
    const { result } = renderHook(() => useFavorites());
    expect(result.current.favorites.size).toBe(0);
  });
});
