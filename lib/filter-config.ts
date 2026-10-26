export type FilterConfig =
  | {
      id: string;
      label: string;
      kind: "multi-select";
      options: readonly string[];
    }
  | {
      id: string;
      label: string;
      kind: "single-select";
      options: readonly string[];
    }
  | {
      id: string;
      label: string;
      kind: "boolean";
    };

export const FILTER_CONFIG = [
  {
    id: "vendors",
    label: "پلتفرم",
    kind: "multi-select",
    options: ["soroush", "rubika"],
  },
  {
    id: "category",
    label: "دسته‌بندی",
    kind: "single-select",
    options: [],
  },
  {
    id: "landscape",
    label: "بازی‌های افقی",
    kind: "boolean",
  },
] as const satisfies readonly FilterConfig[];

export type FilterId = (typeof FILTER_CONFIG)[number]["id"];
