import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const vazirmatn = localFont({
  src: [
    {
      path: "./fonts/Vazirmatn-Regular.woff2",

      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/Vazirmatn-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-vazirmatn",
  display: "swap",
});

export const metadata: Metadata = {
  title: "کاوشگر بازی‌های لایف‌لندز",
  description:
    "بازی مورد علاقه‌ات را در میان بیش از ۷۰۰ بازی لایف‌لندز کشف کن. جستجو، فیلتر و مرتب‌سازی آسان.",
  openGraph: {
    title: "کاوشگر بازی‌های لایف‌لندز",
    description:
      "بازی مورد علاقه‌ات را در میان بیش از ۷۰۰ بازی لایف‌لندز کشف کن.",
    locale: "fa_IR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl" className={vazirmatn.variable}>
      <body className={`${vazirmatn.className} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
