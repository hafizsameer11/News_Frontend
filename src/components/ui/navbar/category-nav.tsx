"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useLanguage } from "@/providers/LanguageProvider";
import { usePathname } from "next/navigation";
import { isActiveRoute } from "@/lib/helpers/navbar-helpers";
import {
  getRootCategories,
  getSubcategories,
  flattenCategories,
} from "@/lib/helpers/category-helpers";
import { CategoryDropdown } from "./category-dropdown";
import { Category } from "@/types/category.types";

interface CategoryNavProps {
  categories: Category[];
  isLoading: boolean;
}

export function CategoryNav({ categories, isLoading }: CategoryNavProps) {
  const { language } = useLanguage();
  const pathname = usePathname();
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const dropdownTimeoutRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [mounted, setMounted] = useState(false);

  // Flatten categories for subcategory lookups
  const allCategoriesFlat = useMemo(() => {
    return flattenCategories(categories);
  }, [categories]);

  // Get only root categories for main navigation
  const rootCategories = useMemo(() => {
    return getRootCategories(categories);
  }, [categories]);

  // Show max 5 root categories in main nav, rest in "More" dropdown
  useEffect(() => {
    setMounted(true);
  }, []);

  // Always show max 5 categories to prevent UI overflow
  const maxVisibleCategories = 5;
  const mainCategories = rootCategories.slice(0, maxVisibleCategories);
  const moreCategories = rootCategories.slice(maxVisibleCategories);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        moreMenuRef.current &&
        !moreMenuRef.current.contains(event.target as Node)
      ) {
        setIsMoreMenuOpen(false);
      }
    }

    if (isMoreMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isMoreMenuOpen]);

  if (isLoading) {
    return (
      <div className="hidden lg:flex items-center justify-center flex-1 px-4">
        <div className="text-sm text-gray-500">Loading...</div>
      </div>
    );
  }

  if (rootCategories.length === 0) {
    return null;
  }

  const handleDropdownClose = () => {
    setOpenDropdown(null);
  };

  return (
    <div
      className="hidden lg:flex items-center space-x-1 flex-1 justify-center px-4 relative min-w-0"
      style={{ overflow: "visible" }}
    >
      <div
        className="flex items-center space-x-1 flex-shrink-0 overflow-x-auto scrollbar-hide max-w-full"
        style={{ overflowY: "visible" }}
      >
        {/* eslint-disable-next-line react-hooks/refs */}
        {mainCategories.map((category) => {
          const categoryPath = `/category/${category.slug}`;
          const isActive = isActiveRoute(pathname, categoryPath);
          const categoryName =
            language === "it" ? category.nameIt : category.nameEn;
          const hasSubcategories =
            getSubcategories(category.id, allCategoriesFlat).length > 0;
          const isDropdownOpen = openDropdown === category.id;

          const handleMouseEnter = () => {
            if (hasSubcategories) {
              // Clear any pending close timeout
              const timeout = dropdownTimeoutRef.current.get(category.id);
              if (timeout) {
                clearTimeout(timeout);
                dropdownTimeoutRef.current.delete(category.id);
              }
              setOpenDropdown(category.id);
            }
          };

          const handleMouseLeave = () => {
            // Add a longer delay before closing to allow moving to dropdown
            // Increased to 500ms to give users more time to move to the dropdown
            const timeout = setTimeout(() => {
              setOpenDropdown(null);
              dropdownTimeoutRef.current.delete(category.id);
            }, 500);
            dropdownTimeoutRef.current.set(category.id, timeout);
          };

          const handleDropdownMouseEnter = () => {
            // Clear any pending close timeout when mouse enters dropdown
            const timeout = dropdownTimeoutRef.current.get(category.id);
            if (timeout) {
              clearTimeout(timeout);
              dropdownTimeoutRef.current.delete(category.id);
            }
            // Ensure dropdown stays open
            if (!isDropdownOpen) {
              setOpenDropdown(category.id);
            }
          };

          const handleDropdownMouseLeave = () => {
            // Close dropdown when mouse leaves the dropdown itself
            const timeout = setTimeout(() => {
              setOpenDropdown(null);
              dropdownTimeoutRef.current.delete(category.id);
            }, 300);
            dropdownTimeoutRef.current.set(category.id, timeout);
          };

          return (
            <div
              key={category.id}
              className="relative"
              style={{ overflow: "visible" }}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              {hasSubcategories ? (
                <>
                  <button
                    ref={(el) => {
                      if (el) buttonRefs.current.set(category.id, el);
                      else buttonRefs.current.delete(category.id);
                    }}
                    onClick={() =>
                      setOpenDropdown(isDropdownOpen ? null : category.id)
                    }
                    className={`px-3 py-2 text-sm font-bold transition whitespace-nowrap flex items-center gap-1 ${
                      isActive
                        ? "text-red-600 border-b-2 border-red-600"
                        : "text-gray-900 hover:text-red-600"
                    }`}
                    aria-expanded={isDropdownOpen}
                    aria-haspopup="true"
                  >
                    {categoryName}
                    <svg
                      className={`w-3 h-3 transition-transform ${
                        isDropdownOpen ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  {isDropdownOpen &&
                    mounted &&
                    typeof window !== "undefined" &&
                    (() => {
                      const button = buttonRefs.current.get(category.id);
                      if (!button) return null;
                      const rect = button.getBoundingClientRect();
                      return createPortal(
                        <div
                          style={{
                            position: "fixed",
                            zIndex: 1000,
                            top: `${rect.bottom + 2}px`,
                            left: `${rect.left}px`,
                          }}
                          onMouseEnter={handleDropdownMouseEnter}
                          onMouseLeave={handleDropdownMouseLeave}
                        >
                          <CategoryDropdown
                            category={category}
                            allCategories={allCategoriesFlat}
                            onClose={handleDropdownClose}
                          />
                        </div>,
                        document.body
                      );
                    })()}
                </>
              ) : (
                <Link
                  href={categoryPath}
                  prefetch={true}
                  className={`px-3 py-2 text-sm font-bold transition whitespace-nowrap ${
                    isActive
                      ? "text-red-600 border-b-2 border-red-600"
                      : "text-gray-900 hover:text-red-600"
                  }`}
                >
                  {categoryName}
                </Link>
              )}
            </div>
          );
        })}
      </div>

      {/* More Dropdown */}
      {moreCategories.length > 0 && (
        <div className="relative flex-shrink-0" ref={moreMenuRef}>
          <button
            onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
            className="px-3 py-2 text-sm font-bold text-gray-900 hover:text-red-600 transition flex items-center gap-1 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded"
            aria-label={language === "it" ? "Altro" : "More"}
            aria-expanded={isMoreMenuOpen}
            aria-haspopup="true"
          >
            {language === "it" ? "Altro" : "More"}
            <svg
              className={`w-4 h-4 transition-transform ${
                isMoreMenuOpen ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {isMoreMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsMoreMenuOpen(false)}
                aria-hidden="true"
              />
              <div
                className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl min-w-[250px] max-h-[500px] overflow-y-auto"
                style={{ zIndex: 1000, position: "absolute" }}
              >
                <div className="py-2">
                  {moreCategories.map((category) => {
                    const categoryPath = `/category/${category.slug}`;
                    const isActive = isActiveRoute(pathname, categoryPath);
                    const categoryName =
                      language === "it" ? category.nameIt : category.nameEn;
                    const hasSubcategories =
                      getSubcategories(category.id, allCategoriesFlat).length >
                      0;

                    return (
                      <div key={category.id} className="relative group">
                        <Link
                          href={categoryPath}
                          prefetch={true}
                          className={`block px-4 py-2 text-sm font-bold transition flex items-center justify-between ${
                            isActive
                              ? "bg-red-50 text-red-600"
                              : "text-gray-900 hover:bg-gray-50 hover:text-red-600"
                          }`}
                          onClick={() => setIsMoreMenuOpen(false)}
                        >
                          <span>{categoryName}</span>
                          {hasSubcategories && (
                            <svg
                              className="w-3 h-3 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          )}
                        </Link>
                        {hasSubcategories && (
                          <div
                            className="absolute left-full top-0 ml-1 bg-white border border-gray-200 rounded-lg shadow-xl min-w-[200px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200"
                            style={{ zIndex: 1000 }}
                          >
                            <div className="py-2">
                              {getSubcategories(
                                category.id,
                                allCategoriesFlat
                              ).map((subcategory) => {
                                const subcategoryPath = `/category/${subcategory.slug}`;
                                const isSubcategoryActive = isActiveRoute(
                                  pathname,
                                  subcategoryPath
                                );
                                const subcategoryName =
                                  language === "it"
                                    ? subcategory.nameIt
                                    : subcategory.nameEn;
                                return (
                                  <Link
                                    key={subcategory.id}
                                    href={subcategoryPath}
                                    prefetch={true}
                                    className={`block px-4 py-2 text-sm transition ${
                                      isSubcategoryActive
                                        ? "bg-red-50 text-red-600 font-semibold"
                                        : "text-gray-700 hover:bg-gray-50 hover:text-red-600"
                                    }`}
                                    onClick={() => setIsMoreMenuOpen(false)}
                                  >
                                    {subcategoryName}
                                  </Link>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
