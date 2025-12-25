"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useCategories } from "@/lib/hooks/useCategories";
import { useLanguage } from "@/providers/LanguageProvider";
import { useAuth } from "@/providers/AuthProvider";
import { usePathname } from "next/navigation";
import { Category } from "@/types/category.types";
import { UtilityBar } from "./navbar/utility-bar";
import { CategoryNav } from "./navbar/category-nav";
import { UserMenu } from "./navbar/user-menu";
import { MobileMenu } from "./navbar/mobile-menu";
import { SearchDropdown } from "./navbar/search-dropdown";
export function Navbar() {
  const { data: categoriesData, isLoading } = useCategories();
  const { t } = useLanguage();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted] = useState(() => typeof window !== "undefined");
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    // Use setTimeout to defer state update
    if (isMobileMenuOpen) {
      const timer = setTimeout(() => {
        setIsMobileMenuOpen(false);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [pathname, isMobileMenuOpen]);

  // Close mobile menu on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isMobileMenuOpen]);

  const categories = (categoriesData as { data?: Category[] } | undefined)?.data || [];

  return (
    <>
      {/* Utility Bar - Top Row */}
      <UtilityBar />

      {/* Main Navigation Bar */}
      <nav
        className="bg-white border-b border-gray-200 w-full sticky top-0 z-50"
        style={{ position: "sticky", top: 0, zIndex: 50 }}
        role="navigation"
        aria-label={t("aria.mainNavigation")}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 max-w-7xl" style={{ overflow: "visible" }}>
          <div
            className="flex items-center justify-between h-16"
            style={{ overflow: "visible" }}
          >
            {/* Left: Hamburger + Logo */}
            <div className="flex items-center gap-3 shrink-0" style={{ position: "relative", zIndex: 100 }}>
              {/* Hamburger Menu - Mobile Only */}
              <button
                ref={menuButtonRef}
                onClick={toggleMobileMenu}
                className="lg:hidden p-2 text-gray-900 hover:text-red-600 active:text-red-700 transition focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded relative"
                style={{ 
                  position: "relative", 
                  zIndex: 101,
                  pointerEvents: "auto",
                  touchAction: "manipulation",
                  WebkitTapHighlightColor: "transparent",
                  cursor: "pointer",
                  userSelect: "none",
                  WebkitUserSelect: "none",
                  MozUserSelect: "none",
                  msUserSelect: "none",
                  isolation: "isolate"
                }}
                aria-label={t("aria.toggleMenu") || "Toggle menu"}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu"
                type="button"
              >
                {isMobileMenuOpen ? (
                  <svg
                    className="w-6 h-6"
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
                ) : (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                )}
              </button>

              {/* Logo - Red CNN Style */}
              <Link
                href="/"
                className="text-2xl md:text-3xl font-bold text-red-600 hover:text-red-700 transition focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded"
                aria-label="NEWS NEXT Home"
              >
                NEWS NEXT
              </Link>
            </div>

            {/* Center: Category Navigation - Desktop */}
            <CategoryNav categories={categories} isLoading={isLoading} />

            {/* Right: Utility Links */}
            <div className="flex items-center gap-2 md:gap-4 shrink-0">
              {/* Watch - with red dot */}
              {/* <Link
                href="/tg"
                prefetch={true}
                className="hidden md:flex items-center gap-2 px-3 py-2 text-sm font-bold text-gray-900 hover:text-red-600 transition focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded"
                aria-label={t("nav.watch")}
              >
                <span className="w-2 h-2 bg-red-600 rounded-full" aria-hidden="true"></span>
                {t("nav.watch")}
              </Link> */}

              {/* Search Dropdown */}
              <SearchDropdown />

              {/* User Menu or Auth Buttons */}
              {!isMounted || authLoading ? (
                // Render default (unauthenticated) state during SSR to prevent hydration mismatch
                <div className="flex items-center gap-2">
                  <Link
                    href="/register"
                    className="hidden md:block px-4 py-2 text-sm font-bold text-gray-900 hover:text-red-600 transition focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded"
                  >
                    {t("nav.register")}
                  </Link>
                  <Link
                    href="/login"
                    className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded transition focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    {t("nav.signIn")}
                  </Link>
                </div>
              ) : isAuthenticated ? (
                <UserMenu />
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/register"
                    className="hidden md:block px-4 py-2 text-sm font-bold text-gray-900 hover:text-red-600 transition focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded"
                  >
                    {t("nav.register")}
                  </Link>
                  <Link
                    href="/login"
                    className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded transition focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    {t("nav.signIn")}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu - Only render after mount to prevent hydration issues */}
      {isMounted && (
        <MobileMenu
          isOpen={isMobileMenuOpen}
          onClose={closeMobileMenu}
          categories={categories}
        />
      )}
    </>
  );
}
