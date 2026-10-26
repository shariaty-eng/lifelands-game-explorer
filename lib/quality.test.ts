import { describe, it, expect } from "vitest";
import { qualityScore } from "./quality";
import type { Game } from "@/types/game";

function makeGame(overrides: Partial<Game> = {}): Game {
  return {
    _id: "x",
    title: "T",
    image: "game/x.webp",
    companyName: "C",
    category: {
      _id: "c",
      title: "cat",
      categoryId: { _id: "c", title: "cat" },
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

describe("qualityScore", () => {
  it("بازی با همه صفر، کیفیت صفر دارد", () => {
    expect(qualityScore(makeGame())).toBe(0);
  });

  it("بازی با score کامل و rating کامل، کیفیت نزدیک 0.8 دارد", () => {
    const g = makeGame({ score: 5, rating: 1, like: 0 });
    // 0.5*1 + 0.3*1 + 0.2*0 = 0.8
    expect(qualityScore(g)).toBeCloseTo(0.8, 5);
  });

  it("rating غیرصفر با score صفر، کیفیت مثبت می‌دهد", () => {
    const g = makeGame({ score: 0, rating: 0.5, like: 0 });
    expect(qualityScore(g)).toBeCloseTo(0.15, 5); // 0.3 * 0.5
  });

  it("like زیاد به‌صورت لگاریتمی فشرده می‌شود", () => {
    const low = makeGame({ like: 10 });
    const high = makeGame({ like: 100 });
    expect(qualityScore(high)).toBeLessThanOrEqual(0.2 + 0.0001);
    expect(qualityScore(high)).toBeGreaterThan(qualityScore(low));
  });

  it("مقادیر خارج از بازه را clamp می‌کند", () => {
    const g = makeGame({ score: 100, rating: 5 });
    expect(qualityScore(g)).toBeLessThanOrEqual(1);
  });
});
