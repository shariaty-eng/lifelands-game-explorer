import { describe, it, expect } from "vitest";
import { resolveImageUrl, cardDimensions } from "./image";

describe("resolveImageUrl", () => {
  it("مسیر نسبی را به URL کامل تبدیل می‌کند", () => {
    expect(resolveImageUrl("game/file-123.webp")).toBe(
      "https://lifelands.ir/game/file-123.webp",
    );
  });

  it("URL مطلق را دست‌نخورده برمی‌گرداند", () => {
    expect(resolveImageUrl("https://cdn.example.com/x.webp")).toBe(
      "https://cdn.example.com/x.webp",
    );
  });

  it("رشته خالی را برمی‌گرداند", () => {
    expect(resolveImageUrl("")).toBe("");
  });
});

describe("cardDimensions", () => {
  it("landscape → 16:9", () => {
    expect(cardDimensions(true)).toEqual({ width: 400, height: 225 });
  });
  it("portrait → 3:4", () => {
    expect(cardDimensions(false)).toEqual({ width: 300, height: 400 });
  });
});
