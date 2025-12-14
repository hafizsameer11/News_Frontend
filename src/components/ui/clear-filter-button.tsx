"use client";

import { useLanguage } from "@/providers/LanguageProvider";

interface ClearFilterButtonProps {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  showText?: boolean;
}

export function ClearFilterButton({ 
  onClick, 
  disabled = false, 
  className = "",
  showText = true 
}: ClearFilterButtonProps) {
  const { t } = useLanguage();

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex items-center gap-2 px-3 py-2 
        text-sm font-medium 
        text-gray-700 bg-white border border-gray-300 
        rounded-md hover:bg-gray-50 hover:border-gray-400 
        transition-colors duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      title={t("admin.clearAllFilters")}
    >
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
      {showText && <span>{t("admin.clearFilters")}</span>}
    </button>
  );
}

