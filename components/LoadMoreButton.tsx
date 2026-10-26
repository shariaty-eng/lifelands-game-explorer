interface LoadMoreButtonProps {
  onClick: () => void;
  isLoading: boolean;
  remaining: number;
}

export function LoadMoreButton({
  onClick,
  isLoading,
  remaining,
}: LoadMoreButtonProps) {
  return (
    <div className="flex justify-center pt-4">
      <button
        type="button"
        onClick={onClick}
        disabled={isLoading}
        className="rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading
          ? "در حال بارگذاری..."
          : `نمایش بیشتر (${remaining.toLocaleString("fa-IR")} بازی دیگر)`}
      </button>
    </div>
  );
}
