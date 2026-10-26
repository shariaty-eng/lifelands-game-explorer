// lib/normalize.ts

/**
 * نرمال‌سازی متن فارسی برای تطبیق در جستجو.
 * بدون هیچ ایمپورت React — کاملاً خالص و قابل تست واحد.
 *
 * قوانین (طبق تسک):
 *  1. یکسان‌سازی ی/ي و ک/ك
 *  2. تبدیل ارقام فارسی/عربی به لاتین
 *  3. حذف ZWNJ (نیم‌فاصله)
 *  4. فشرده‌سازی فاصله‌های سفید
 */

const ARABIC_YEH = "\u064A"; // ي
const PERSIAN_YEH = "\u06CC"; // ی
const ARABIC_KAF = "\u0643"; // ك
const PERSIAN_KAF = "\u06A9"; // ک

const ZWNJ = "\u200C"; // نیم‌فاصله
const ZWJ = "\u200D"; // اتصال‌دهنده عرض صفر

/** ارقام فارسی (۰-۹) و عربی (٠-٩) */
const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

function mapDigits(input: string): string {
  let out = "";
  for (const ch of input) {
    const pIdx = PERSIAN_DIGITS.indexOf(ch);
    if (pIdx !== -1) {
      out += String(pIdx);
      continue;
    }
    const aIdx = ARABIC_DIGITS.indexOf(ch);
    if (aIdx !== -1) {
      out += String(aIdx);
      continue;
    }
    out += ch;
  }
  return out;
}

export function normalizePersian(input: string): string {
  if (!input) return "";

  let out = input;
  out = out.replaceAll(ARABIC_YEH, PERSIAN_YEH);
  out = out.replaceAll(ARABIC_KAF, PERSIAN_KAF);
  out = mapDigits(out);
  out = out.replaceAll(ZWNJ, "");
  out = out.replaceAll(ZWJ, "");
  out = out.replace(/\s+/g, " ").trim();
  return out;
}
export function normalizeForMatch(input: string): string {
  return normalizePersian(input).toLowerCase();
}
