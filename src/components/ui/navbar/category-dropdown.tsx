"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/providers/LanguageProvider";
import { usePathname } from "next/navigation";
import { isActiveRoute } from "@/lib/helpers/navbar-helpers";
import {
  getSubcategories,
  getCategoryLevel,
} from "@/lib/helpers/category-helpers";
import { Category } from "@/types/category.types";

interface CategoryDropdownProps {
  category: Category;
  allCategories: Category[];
  onClose: () => void;
}

export function CategoryDropdown({
  category,
  allCategories,
  onClose,
}: CategoryDropdownProps) {
  const { language, t } = useLanguage();
  const pathname = usePathname();
  const [hoveredSubcategory, setHoveredSubcategory] = useState<string | null>(
    null
  );
  const [hoveredChild, setHoveredChild] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const subcategories = getSubcategories(category.id, allCategories);
  const hasSubcategories = subcategories.length > 0;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // Close on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const handleMouseEnter = () => {
    // Clear any pending timeouts when mouse enters dropdown
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const handleMouseLeave = () => {
    // Don't close immediately - let parent handle it
    // This prevents premature closing when moving between dropdown sections
    // The parent component will handle closing when mouse leaves the entire dropdown area
  };

  const categoryName = language === "it" ? category.nameIt : category.nameEn;
  const categoryPath = `/category/${category.slug}`;
  const isActive = isActiveRoute(pathname, categoryPath);

  // Get direct children (level 1) - categories that have this category as direct parent
  const directChildren = subcategories.filter(
    (cat) => cat.parentId === category.id
  );

  // If no direct children, don't show dropdown
  if (directChildren.length === 0) {
    return null;
  }

  // Calculate number of columns based on subcategory count - more compact
  const columnCount =
    directChildren.length > 8
      ? 4
      : directChildren.length > 4
      ? 3
      : directChildren.length > 2
      ? 2
      : 1;

  return (
    <div
      ref={dropdownRef}
      className="bg-white border border-gray-200 rounded-md shadow-lg min-w-[80px] max-w-[480px] py-2"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseEnter}
    >
      {/* Subcategories List - Compact Design */}
      <div className="py-1">
        {directChildren.map((subcategory) => {
          const subcategoryName =
            language === "it" ? subcategory.nameIt : subcategory.nameEn;
          const subcategoryPath = `/category/${subcategory.slug}`;
          const isSubcategoryActive = isActiveRoute(pathname, subcategoryPath);
          const subcategoryChildren = getSubcategories(
            subcategory.id,
            allCategories
          );
          const hasChildren = subcategoryChildren.length > 0;

          return (
            <div
              key={subcategory.id}
              className="relative"
              onMouseEnter={() => setHoveredSubcategory(subcategory.id)}
              onMouseLeave={() => setHoveredSubcategory(null)}
            >
              <Link
                href={subcategoryPath}
                onClick={onClose}
                className={`flex items-center justify-between px-4 py-2 text-sm transition-colors ${
                  isSubcategoryActive
                    ? "bg-red-50 text-red-600 font-semibold"
                    : "text-gray-700 hover:bg-gray-50 hover:text-red-600"
                }`}
              >
                <span className="flex-1">{subcategoryName}</span>
                {hasChildren && (
                  <svg
                    className="w-3.5 h-3.5 text-gray-400 ml-2 shrink-0"
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

              {/* Third Level Dropdown (Grandchildren) - Compact */}
              {hasChildren && hoveredSubcategory === subcategory.id && (
                <div
                  className="absolute left-full top-0 ml-1 bg-white border border-gray-200 rounded-md shadow-lg min-w-fit py-1"
                  style={{ zIndex: 1100 }}
                >
                  {subcategoryChildren.map((child) => {
                    const childName =
                      language === "it" ? child.nameIt : child.nameEn;
                    const childPath = `/category/${child.slug}`;
                    const isChildActive = isActiveRoute(pathname, childPath);
                    const childChildren = getSubcategories(
                      child.id,
                      allCategories
                    );
                    const hasChildChildren = childChildren.length > 0;

                    return (
                      <div
                        key={child.id}
                        className="relative"
                        onMouseEnter={() => setHoveredChild(child.id)}
                        onMouseLeave={() => setHoveredChild(null)}
                      >
                        <Link
                          href={childPath}
                          onClick={onClose}
                          className={`flex items-center justify-between px-4 py-2 text-sm transition-colors ${
                            isChildActive
                              ? "bg-red-50 text-red-600 font-semibold"
                              : "text-gray-700 hover:bg-gray-50 hover:text-red-600"
                          }`}
                        >
                          <span className="flex-1">{childName}</span>
                          {hasChildChildren && (
                            <svg
                              className="w-3 h-3 text-gray-400 ml-2 shrink-0"
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

                        {/* Fourth Level Dropdown (Great-grandchildren) */}
                        {hasChildChildren && hoveredChild === child.id && (
                          <div
                            className="absolute left-full top-0 ml-1 bg-white border border-gray-200 rounded-md shadow-lg min-w-[180px] py-1"
                            style={{ zIndex: 1200 }}
                          >
                            {childChildren.map((grandchild) => {
                              const grandchildName =
                                language === "it"
                                  ? grandchild.nameIt
                                  : grandchild.nameEn;
                              const grandchildPath = `/category/${grandchild.slug}`;
                              const isGrandchildActive = isActiveRoute(
                                pathname,
                                grandchildPath
                              );
                              return (
                                <Link
                                  key={grandchild.id}
                                  href={grandchildPath}
                                  onClick={onClose}
                                  className={`block px-4 py-2 text-sm transition-colors ${
                                    isGrandchildActive
                                      ? "bg-red-50 text-red-600 font-semibold"
                                      : "text-gray-700 hover:bg-gray-50 hover:text-red-600"
                                  }`}
                                >
                                  {grandchildName}
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* View All Link - Compact Footer */}
      <div className="border-t border-gray-100 mt-1 pt-1">
        <Link
          href={categoryPath}
          onClick={onClose}
          className="flex items-center justify-center px-4 py-2 text-xs font-medium text-gray-600 hover:text-red-600 transition-colors"
        >
          {t("nav.viewAll")}
          <svg
            className="w-3 h-3 ml-1"
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
        </Link>
      </div>
    </div>
  );
}
