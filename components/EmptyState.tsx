interface EmptyStateProps {
  variant: "no-results" | "error";
  onAction: () => void;
}

export function EmptyState({ variant, onAction }: EmptyStateProps) {
  const isError = variant === "error";
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center">
      <svg
        className="h-12 w-12 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        {isError ? (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        ) : (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        )}
      </svg>
      <h2 className="mt-4 text-lg font-bold text-gray-900">
        {isError ? "خطا در دریافت بازی‌ها" : "بازی‌ای یافت نشد"}
      </h2>
      <p className="mt-1 max-w-sm text-sm text-gray-500">
        {isError
          ? "مشکلی در ارتباط با سرور پیش آمد. لطفاً دوباره تلاش کنید."
          : "فیلترها یا عبارت جستجو را تغییر دهید تا نتایج بیشتری ببینید."}
      </p>
      <button
        type="button"
        onClick={onAction}
        className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
      >
        {isError ? "تلاش دوباره" : "پاک کردن فیلترها"}
      </button>
    </div>
  );
}
