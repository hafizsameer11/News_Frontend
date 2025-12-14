"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { NewsCard } from "@/components/ui/news-card";
import { useSearch } from "@/lib/hooks/useSearch";
import { useLanguage } from "@/providers/LanguageProvider";
import { Loading } from "@/components/ui/loading";
import { ErrorMessage } from "@/components/ui/error-message";
import Link from "next/link";
import { SearchFilters } from "@/components/search/search-filters";
import { SearchFilters as SearchFiltersType } from "@/lib/api/modules/search.api";
import { useBehaviorTracking, trackSearch } from "@/lib/hooks/useBehaviorTracking";

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams?.get("q") || "";
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<SearchFiltersType>({});
  const [page, setPage] = useState(1);
  const { language, t } = useLanguage();
  const { mutate: track } = useBehaviorTracking();

  const { data: searchData, isLoading, error } = useSearch(searchQuery, { ...filters, page, limit: 12 });

  // Update query when URL param changes (e.g., browser back/forward)
  useEffect(() => {
    const query = searchParams?.get("q") || "";
    setSearchQuery(query);
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.length >= 2) {
      // Track search query
      trackSearch(track, searchQuery, {
        filters: filters,
        timestamp: new Date().toISOString(),
      });
      
      // Update URL without page reload
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const results = searchData?.data;
  const hasResults =
    results &&
    (results.news.length > 0 || results.categories.length > 0 || results.transports.length > 0);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-6 text-gray-900">
          {language === "it" ? "Cerca" : "Search"}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <SearchFilters onFiltersChange={(newFilters) => {
              setFilters(newFilters);
              setPage(1); // Reset to first page when filters change
            }} />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === "it" ? "Cerca notizie, categorie..." : "Search news, categories..."}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-gray-900"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
            >
              {t("nav.search")}
            </button>
          </div>
          {searchQuery.length > 0 && searchQuery.length < 2 && (
            <p className="mt-2 text-sm text-gray-500">
              {language === "it"
                ? "Inserisci almeno 2 caratteri per cercare"
                : "Enter at least 2 characters to search"}
            </p>
          )}
        </form>

        {/* Loading State */}
        {isLoading && <Loading />}

        {/* Error State */}
        {error && <ErrorMessage error={error} />}

        {/* No Query State */}
        {!searchQuery && !isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-2">
              {language === "it"
                ? "Inizia a cercare inserendo una parola chiave"
                : "Start searching by entering a keyword"}
            </p>
            <p className="text-gray-500">
              {language === "it"
                ? "Cerca tra notizie, categorie e informazioni sui trasporti"
                : "Search through news, categories, and transport information"}
            </p>
          </div>
        )}

        {/* No Results */}
        {searchQuery.length >= 2 && !isLoading && !error && !hasResults && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-2">
              {language === "it" ? "Nessun risultato trovato" : "No results found"}
            </p>
            <p className="text-gray-500">
              {language === "it"
                ? `Nessun risultato per "${searchQuery}". Prova con altre parole chiave.`
                : `No results for "${searchQuery}". Try different keywords.`}
            </p>
          </div>
        )}

        {/* Search Results */}
        {hasResults && (
          <div className="space-y-8">
            {/* News Results */}
            {results.news.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                  {language === "it" ? "Notizie" : "News"} ({results.news.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.news.map((news) => (
                    <NewsCard
                      key={news.id}
                      news={{
                        ...news,
                        category: {
                          id: "",
                          nameEn: news.category.nameEn,
                          nameIt: news.category.nameIt,
                          slug: "",
                        },
                        createdAt: news.publishedAt || new Date().toISOString(),
                        isBreaking: false,
                        isFeatured: false,
                        status: "PUBLISHED",
                      }}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Categories Results */}
            {results.categories.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                  {t("categories.title")} ({results.categories.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {results.categories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/category/${category.slug}`}
                      className="block p-4 bg-white border border-gray-200 rounded-lg hover:border-red-600 hover:shadow-md transition"
                    >
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {language === "it" ? category.nameIt : category.nameEn}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {language === "it" ? "Visualizza categoria" : "View category"}
                      </p>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Transport Results */}
            {results.transports.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                  {language === "it" ? "Trasporti" : "Transport"} ({results.transports.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.transports.map((transport) => (
                    <div
                      key={transport.id}
                      className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{transport.name}</h3>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {transport.type}
                        </span>
                      </div>
                      {transport.description && (
                        <p className="text-sm text-gray-600 mb-2">{transport.description}</p>
                      )}
                      {transport.city && (
                        <p className="text-xs text-gray-500">
                          {language === "it" ? "Città" : "City"}: {transport.city}
                        </p>
                      )}
                      {transport.contactInfo && (
                        <p className="text-xs text-gray-500 mt-1">{transport.contactInfo}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* Pagination */}
        {hasResults && results.news.length >= 12 && (
          <div className="mt-8 flex justify-center items-center gap-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
            >
              {language === "it" ? "Precedente" : "Previous"}
            </button>
            <span className="text-gray-600">
              {language === "it" ? "Pagina" : "Page"} {page}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={results.news.length < 12}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
            >
              {language === "it" ? "Successivo" : "Next"}
            </button>
          </div>
        )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
