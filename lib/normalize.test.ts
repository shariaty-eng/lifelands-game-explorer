import { describe, it, expect } from "vitest";
import { normalizePersian, normalizeForMatch } from "./normalize";

describe("normalizePersian", () => {
  it("ي عربی را به ی فارسی تبدیل می‌کند", () => {
    expect(normalizePersian("ي")).toBe("ی");
    expect(normalizePersian("علي")).toBe("علی");
  });

  it("ك عربی را به ک فارسی تبدیل می‌کند", () => {
    expect(normalizePersian("ك")).toBe("ک");
    expect(normalizePersian("كتاب")).toBe("کتاب");
  });

  it("ارقام فارسی را به لاتین تبدیل می‌کند", () => {
    expect(normalizePersian("۱۲۳۴۵۶۷۸۹۰")).toBe("1234567890");
  });

  it("ارقام عربی را به لاتین تبدیل می‌کند", () => {
    expect(normalizePersian("٠١٢٣٤٥٦٧٨٩")).toBe("0123456789");
  });

  it("ZWNJ (نیم‌فاصله) را حذف می‌کند", () => {
    expect(normalizePersian("می\u200Cروم")).toBe("میروم");
    expect(normalizePersian("کتاب\u200Cها")).toBe("کتابها");
  });

  it("فاصله‌های سفید را فشرده و trim می‌کند", () => {
    expect(normalizePersian("  سلام   دنیا  ")).toBe("سلام دنیا");
    expect(normalizePersian("a\t\tb\nc")).toBe("a b c");
  });

  it("ترکیب همه قوانین را با هم اعمال می‌کند", () => {
    const input = "  علي\u200Cرضا ۱۲۳  ";
    expect(normalizePersian(input)).toBe("علیرضا 123");
  });

  it("رشته خالی را برمی‌گرداند", () => {
    expect(normalizePersian("")).toBe("");
  });
});

describe("normalizeForMatch", () => {
  it("علاوه بر نرمال‌سازی، lowercase می‌کند", () => {
    expect(normalizeForMatch("HELLO")).toBe("hello");
    expect(normalizeForMatch("Cube Away")).toBe("cube away");
  });

  it("ترکیب فارسی و انگلیسی را درست نرمال می‌کند", () => {
    expect(normalizeForMatch("بازي ۱۲۳ ABC")).toBe("بازی 123 abc");
  });
});
