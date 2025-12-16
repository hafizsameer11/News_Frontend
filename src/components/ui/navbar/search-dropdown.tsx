"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/providers/LanguageProvider";
import { useSearch } from "@/lib/hooks/useSearch";
import { Loading } from "@/components/ui/loading";

export function SearchDropdown() {
  const { language, t } = useLanguage();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce search query (300ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch search results
  const { data: searchData, isLoading } = useSearch(debouncedQuery, {
    limit: 7,
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery("");
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle search submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.length >= 2) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsOpen(false);
      setSearchQuery("");
    }
  };

  const results = searchData?.data;
  const hasResults =
    results &&
    (results.news.length > 0 ||
      results.categories.length > 0 ||
      results.transports.length > 0);

  // Combine and limit results (max 7 total)
  const combinedResults: Array<{
    type: "news" | "category" | "transport";
    id: string;
    title: string;
    href: string;
    subtitle?: string;
  }> = [];

  if (results) {
    // Add news items (max 5)
    results.news.slice(0, 5).forEach((item) => {
      combinedResults.push({
        type: "news",
        id: item.id,
        title: item.title,
        href: `/news/${item.slug || item.id}`,
        subtitle: item.category
          ? language === "it"
            ? item.category.nameIt
            : item.category.nameEn
          : undefined,
      });
    });

    // Add categories (max 2)
    results.categories.slice(0, 2).forEach((item) => {
      combinedResults.push({
        type: "category",
        id: item.id,
        title: language === "it" ? item.nameIt : item.nameEn,
        href: `/category/${item.slug}`,
      });
    });

    // Limit to 7 total
    combinedResults.splice(7);
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-900 hover:text-red-600 transition focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded"
        aria-label={t("aria.search")}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-[55]"
            onClick={() => {
              setIsOpen(false);
              setSearchQuery("");
            }}
            aria-hidden="true"
          />
          <div
            className="absolute top-full right-0 mt-2 w-96 max-w-[90vw] bg-white border border-gray-200 rounded-lg shadow-xl"
            style={{ zIndex: 1000, position: "absolute" }}
          >
            {/* Search Input */}
            <form
              onSubmit={handleSubmit}
              className="p-4 border-b border-gray-200"
            >
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    language === "it"
                      ? "Cerca notizie, categorie..."
                      : "Search news, categories..."
                  }
                  className="w-full px-4 py-2 pl-10 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-gray-900 text-sm"
                />
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                {isLoading && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              {searchQuery.length > 0 && searchQuery.length < 2 && (
                <p className="mt-2 text-xs text-gray-500">
                  {language === "it"
                    ? "Inserisci almeno 2 caratteri"
                    : "Enter at least 2 characters"}
                </p>
              )}
            </form>

            {/* Results */}
            {debouncedQuery.length >= 2 ? (
              <div className="max-h-96 overflow-y-auto">
                {isLoading ? (
                  <div className="p-8 flex justify-center">
                    <Loading />
                  </div>
                ) : hasResults && combinedResults.length > 0 ? (
                  <>
                    <div className="py-2">
                      {combinedResults.map((item) => (
                        <Link
                          key={`${item.type}-${item.id}`}
                          href={item.href}
                          onClick={() => {
                            setIsOpen(false);
                            setSearchQuery("");
                          }}
                          className="block px-4 py-3 hover:bg-gray-50 transition group"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-0.5">
                              {item.type === "news" && (
                                <svg
                                  className="w-4 h-4 text-gray-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                                  />
                                </svg>
                              )}
                              {item.type === "category" && (
                                <svg
                                  className="w-4 h-4 text-gray-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                                  />
                                </svg>
                              )}
                              {item.type === "transport" && (
                                <svg
                                  className="w-4 h-4 text-gray-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                                  />
                                </svg>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 group-hover:text-red-600 transition truncate">
                                {item.title}
                              </p>
                              {item.subtitle && (
                                <p className="text-xs text-gray-500 mt-0.5 truncate">
                                  {item.subtitle}
                                </p>
                              )}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                    <div className="border-t border-gray-200 p-2">
                      <Link
                        href={`/search?q=${encodeURIComponent(debouncedQuery)}`}
                        onClick={() => {
                          setIsOpen(false);
                          setSearchQuery("");
                        }}
                        className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded transition text-center font-medium"
                      >
                        {language === "it"
                          ? "Visualizza tutti i risultati"
                          : "View all results"}{" "}
                        →
                      </Link>
                    </div>
                  </>
                ) : (
                  <div className="p-8 text-center">
                    <p className="text-sm text-gray-500">
                      {language === "it"
                        ? "Nessun risultato trovato"
                        : "No results found"}
                    </p>
                    <Link
                      href={`/search?q=${encodeURIComponent(debouncedQuery)}`}
                      onClick={() => {
                        setIsOpen(false);
                        setSearchQuery("");
                      }}
                      className="mt-2 inline-block text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      {language === "it"
                        ? "Ricerca avanzata"
                        : "Advanced Search"}{" "}
                      →
                    </Link>
                  </div>
                )}
              </div>
            ) : debouncedQuery.length > 0 && debouncedQuery.length < 2 ? (
              <div className="p-8 text-center">
                <p className="text-sm text-gray-500">
                  {language === "it"
                    ? "Inserisci almeno 2 caratteri per cercare"
                    : "Enter at least 2 characters to search"}
                </p>
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="text-sm text-gray-500">
                  {language === "it"
                    ? "Inizia a digitare per cercare"
                    : "Start typing to search"}
                </p>
                <Link
                  href="/search"
                  onClick={() => {
                    setIsOpen(false);
                    setSearchQuery("");
                  }}
                  className="mt-2 inline-block text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  {t("nav.advancedSearch")} →
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
