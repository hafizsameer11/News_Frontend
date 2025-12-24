"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import { NewsCard } from "@/components/ui/news-card";
import { useNews } from "@/lib/hooks/useNews";
import { useLanguage } from "@/providers/LanguageProvider";
import { Loading } from "@/components/ui/loading";
import { ErrorMessage } from "@/components/ui/error-message";
import Link from "next/link";
import { RelatedCategories } from "@/components/category/related-categories";
import { StructuredData } from "@/components/seo/StructuredData";
import { seoApi } from "@/lib/api/modules/seo.api";
import { useCategories } from "@/lib/hooks/useCategories";
import { getSubcategories, getParentCategory, getCategoryPath, getSubcategoriesRecursive } from "@/lib/helpers/category-helpers";

interface CategoryClientProps {
  category: any;
  initialNews: any[];
  structuredData?: any;
}

export function CategoryClient({ category, initialNews, structuredData: initialStructuredData }: CategoryClientProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { language, t } = useLanguage();
  const [page, setPage] = useState(Number(searchParams?.get("page")) || 1);
  const [structuredData, setStructuredData] = useState<any>(initialStructuredData);
  
  // Fetch all categories to get subcategories and parent
  const { data: categoriesData } = useCategories();
  const allCategories = categoriesData?.data || [];
  
  // Get subcategories for this category (direct children only - grandchildren accessible through children pages)
  const subcategories = useMemo(() => {
    if (!category || !category.id || !allCategories.length) return [];
    // Get direct children only for the subcategories section
    // Users can navigate to grandchildren through the direct children pages
    return getSubcategories(category.id, allCategories);
  }, [category, allCategories]);
  
  // Get parent category
  const parentCategory = useMemo(() => {
    if (!category || !category.parentId || !allCategories.length) return null;
    return getParentCategory(category.parentId, allCategories);
  }, [category, allCategories]);
  
  // Get category path for breadcrumb
  const categoryPath = useMemo(() => {
    if (!category || !allCategories.length) return [];
    return getCategoryPath(category, allCategories);
  }, [category, allCategories]);

  // Fetch structured data if not provided
  useEffect(() => {
    if (!initialStructuredData && category?.slug) {
      const fetchStructuredData = async () => {
        try {
          const response = await seoApi.getCategoryStructuredData(category.slug);
          if (response.success && response.data) {
            setStructuredData(response.data);
          }
        } catch (error) {
          console.error("Failed to fetch category structured data:", error);
        }
      };
      fetchStructuredData();
    }
  }, [category?.slug, initialStructuredData]);

  // Fetch news for this category
  const {
    data: newsData,
    isLoading: newsLoading,
    error: newsError,
  } = useNews({
    categoryId: category?.id,
    status: "PUBLISHED",
    page,
    limit: 12,
  });

  const categoryNews = newsData?.data?.news || initialNews || [];
  const categoryName = category 
    ? (language === "it" ? category.nameIt : category.nameEn)
    : null;
  const categoryDescription = category?.description
    ? (language === "it"
      ? category.descriptionIt
      : category.descriptionEn)
    : null;

  // Show loading state
  if (newsLoading && page === 1) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 max-w-7xl py-8">
          <Loading />
        </main>
      </div>
    );
  }

  // Show error state
  if (newsError && page === 1) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 max-w-7xl py-8">
          <ErrorMessage error={newsError} />
        </main>
      </div>
    );
  }

  // Category not found
  if (!category) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 max-w-7xl py-8 text-center">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">Category Not Found</h1>
          <p className="text-gray-600 mb-6">
            The category you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            {t("nav.home")}
          </Link>
        </main>
      </div>
    );
  }

  return (
    <>
      {structuredData && <StructuredData data={structuredData} id="category-structured-data" />}
      <div className="min-h-screen flex flex-col">
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 max-w-7xl py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-9">
              {/* Category Header */}
              <div className="mb-8">
                {/* Enhanced Breadcrumb with icons */}
                <nav className="flex items-center gap-2 text-sm mb-4" aria-label="Breadcrumb">
                  <Link 
                    href="/" 
                    className="text-gray-600 hover:text-red-600 transition flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    {t("nav.home")}
                  </Link>
                  {categoryPath.length > 1 && categoryPath.map((pathCategory, index) => {
                    const isLast = index === categoryPath.length - 1;
                    const pathCategoryName = language === "it" ? pathCategory.nameIt : pathCategory.nameEn;
                    return (
                      <span key={pathCategory.id} className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        {isLast ? (
                          <span className="text-gray-900 font-semibold">{pathCategoryName}</span>
                        ) : (
                          <Link 
                            href={`/category/${pathCategory.slug}`} 
                            className="text-gray-600 hover:text-red-600 transition font-medium"
                          >
                            {pathCategoryName}
                          </Link>
                        )}
                      </span>
                    );
                  })}
                  {categoryPath.length === 1 && (
                    <>
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      <span className="text-gray-900 font-semibold">{categoryName}</span>
                    </>
                  )}
                </nav>
                
                <h1 className="text-4xl md:text-5xl font-bold mb-3 text-gray-900">{categoryName}</h1>
                {categoryDescription && (
                  <p className="text-gray-600 text-lg mb-4 leading-relaxed">{categoryDescription}</p>
                )}
                
                {/* Category Meta Information */}
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-700 rounded-full font-medium">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                    {newsData?.data?.meta?.total || categoryNews.length}{" "}
                    {(newsData?.data?.meta?.total || categoryNews.length) === 1
                      ? language === "it"
                        ? "articolo"
                        : "article"
                      : language === "it"
                      ? "articoli"
                      : "articles"}
                  </span>
                  {subcategories.length > 0 && (
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full font-medium">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      {subcategories.length} {subcategories.length === 1 ? (language === "it" ? "sottocategoria" : "subcategory") : (language === "it" ? "sottocategorie" : "subcategories")}
                    </span>
                  )}
                  {parentCategory && (
                    <Link
                      href={`/category/${parentCategory.slug}`}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition font-medium"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                      {language === "it" ? "Categoria principale" : "Parent category"}
                    </Link>
                  )}
                </div>
              </div>

              {/* Subcategories Section - Shows direct children, which can be accessed to reach grandchildren */}
              {subcategories.length > 0 && (
                <div className="mb-8 bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {language === "it" ? "Sottocategorie" : "Subcategories"}
                    </h2>
                    <span className="text-sm text-gray-500">
                      {subcategories.length} {subcategories.length === 1 ? (language === "it" ? "sottocategoria" : "subcategory") : (language === "it" ? "sottocategorie" : "subcategories")}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {subcategories
                      .sort((a, b) => a.order - b.order)
                      .map((subcategory) => {
                        const subcategoryName = language === "it" ? subcategory.nameIt : subcategory.nameEn;
                        const subcategoryPath = `/category/${subcategory.slug}`;
                        const isSubcategoryActive = pathname === subcategoryPath;
                        // Check if this subcategory has children (grandchildren)
                        const hasChildren = getSubcategories(subcategory.id, allCategories).length > 0;
                        
                        return (
                          <Link
                            key={subcategory.id}
                            href={subcategoryPath}
                            className={`group block p-5 bg-white rounded-lg border-2 transition-all duration-200 ${
                              isSubcategoryActive
                                ? "border-red-600 shadow-md"
                                : "border-gray-200 hover:border-red-600 hover:shadow-lg"
                            }`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h3 className={`font-semibold text-base transition ${
                                isSubcategoryActive
                                  ? "text-red-600"
                                  : "text-gray-900 group-hover:text-red-600"
                              }`}>
                                {subcategoryName}
                              </h3>
                              {hasChildren && (
                                <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                                  {getSubcategories(subcategory.id, allCategories).length}
                                </span>
                              )}
                            </div>
                            {subcategory.description && (
                              <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                                {subcategory.description}
                              </p>
                            )}
                            <div className="mt-3 flex items-center justify-between">
                              <div className="flex items-center text-xs text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                {language === "it" ? "Esplora" : "Explore"}
                                <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </div>
                              {hasChildren && (
                                <span className="text-xs text-gray-500">
                                  {language === "it" ? "Ha sottocategorie" : "Has subcategories"}
                                </span>
                              )}
                            </div>
                          </Link>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* News Grid */}
              {categoryNews.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 text-lg mb-4">{t("news.noNews")}</p>
                  <p className="text-gray-500">
                    {language === "it"
                      ? "Torna più tardi per nuovi articoli in questa categoria."
                      : "Check back later for new articles in this category."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categoryNews.map((news) => (
                    <NewsCard key={news.id} news={news} />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {newsData?.data?.meta && newsData.data.meta.totalPages > 1 && (
                <div className="mt-8 flex justify-center items-center gap-4">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const newPage = Math.max(1, page - 1);
                      setPage(newPage);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    disabled={page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 active:bg-gray-100 transition touch-manipulation"
                    style={{ touchAction: "manipulation", userSelect: "none" }}
                    type="button"
                  >
                    {t("common.previous")}
                  </button>
                  <span className="px-4 py-2 text-gray-600">
                    {language === "it" ? "Pagina" : "Page"} {page}{" "}
                    {language === "it" ? "di" : "of"} {newsData.data.meta.totalPages}
                  </span>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const newPage = Math.min(newsData.data.meta.totalPages, page + 1);
                      setPage(newPage);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    disabled={page === newsData.data.meta.totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 active:bg-gray-100 transition touch-manipulation"
                    style={{ touchAction: "manipulation", userSelect: "none" }}
                    type="button"
                  >
                    {t("common.next")}
                  </button>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-3 space-y-6">
              <RelatedCategories
                currentCategoryId={category.id}
                currentCategoryParentId={category.parentId}
              />
            </aside>
          </div>
        </main>
      </div>
    </>
  );
}

