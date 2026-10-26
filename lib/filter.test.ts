import { describe, it, expect } from "vitest";
import { filterGames, sortGames, UNSPECIFIED_VENDOR } from "./filter";
import type { Game } from "@/types/game";

function makeGame(overrides: Partial<Game> = {}): Game {
  return {
    _id: Math.random().toString(36),
    title: "T",
    image: "game/x.webp",
    companyName: "C",
    category: {
      _id: "c",
      title: "معمایی",
      categoryId: { _id: "c", title: "معمایی" },
    },
    score: 0,
    rating: 0,
    level: 1,
    like: 0,
    seenCount: 0,
    runCount: 0,
    vitrinThirdPartyVendors: [],
    isLandscape: true,
    createdAtIso: "2025-01-01T00:00:00.000Z",
    updatedAtIso: "2025-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("filterGames", () => {
  it("جستجو در title و companyName کار می‌کند (با نرمال‌سازی)", () => {
    const games = [
      makeGame({ title: "Cube Away", companyName: "Lifelands" }),
      makeGame({ title: "بازي فکري", companyName: "شركت A" }),
    ];
    const result = filterGames(games, {
      query: "بازی فکری", // با ي و ك عربی
      selectedVendors: [],
    });
    expect(result).toHaveLength(1);
    expect(result[0]?.title).toBe("بازي فکري");
  });

  it("فیلتر vendor فقط بازی‌های با vendor مطابق را برمی‌گرداند", () => {
    const games = [
      makeGame({ vitrinThirdPartyVendors: ["soroush"] }),
      makeGame({ vitrinThirdPartyVendors: ["rubika"] }),
      makeGame({ vitrinThirdPartyVendors: [] }),
    ];
    const result = filterGames(games, {
      query: "",
      selectedVendors: ["soroush"],
    });
    expect(result).toHaveLength(1);
  });

  it("با انتخاب vendor، بازی‌های بدون vendor حذف می‌شوند مگر unspecified انتخاب شود", () => {
    const games = [
      makeGame({ vitrinThirdPartyVendors: ["soroush"] }),
      makeGame({ vitrinThirdPartyVendors: [] }),
    ];

    const withoutUnspecified = filterGames(games, {
      query: "",
      selectedVendors: ["soroush"],
    });
    expect(withoutUnspecified).toHaveLength(1);

    const withUnspecified = filterGames(games, {
      query: "",
      selectedVendors: ["soroush", UNSPECIFIED_VENDOR],
    });
    expect(withUnspecified).toHaveLength(2);
  });

  it("فقط unspecified انتخاب شود، فقط بازی‌های بدون vendor برمی‌گردند", () => {
    const games = [
      makeGame({ vitrinThirdPartyVendors: ["soroush"] }),
      makeGame({ vitrinThirdPartyVendors: [] }),
    ];
    const result = filterGames(games, {
      query: "",
      selectedVendors: [UNSPECIFIED_VENDOR],
    });
    expect(result).toHaveLength(1);
  });

  it("فیلتر دسته‌بندی و favoritesOnly کار می‌کند", () => {
    const games = [
      makeGame({
        _id: "a",
        category: {
          _id: "1",
          title: "معمایی",
          categoryId: { _id: "1", title: "معمایی" },
        },
      }),
      makeGame({
        _id: "b",
        category: {
          _id: "2",
          title: "اکشن",
          categoryId: { _id: "2", title: "اکشن" },
        },
      }),
    ];
    const result = filterGames(games, {
      query: "",
      selectedVendors: [],
      selectedCategory: "اکشن",
      favoritesOnly: true,
      favoriteIds: new Set(["b"]),
    });
    expect(result.map((g) => g._id)).toEqual(["b"]);
  });
});

describe("sortGames", () => {
  it("بر اساس score نزولی مرتب می‌کند", () => {
    const games = [
      makeGame({ score: 1 }),
      makeGame({ score: 5 }),
      makeGame({ score: 3 }),
    ];
    const sorted = sortGames(games, "score", "desc");
    expect(sorted.map((g) => g.score)).toEqual([5, 3, 1]);
  });

  it("بر اساس quality مرتب می‌کند", () => {
    const low = makeGame({ score: 0, rating: 0, like: 0 });
    const high = makeGame({ score: 5, rating: 1, like: 100 });
    const sorted = sortGames([low, high], "quality", "desc");
    expect(sorted[0]).toBe(high);
  });

  it("آرایه ورودی را mutation نمی‌کند", () => {
    const games = [makeGame({ score: 1 }), makeGame({ score: 5 })];
    const copy = [...games];
    sortGames(games, "score", "desc");
    expect(games).toEqual(copy);
  });
});
