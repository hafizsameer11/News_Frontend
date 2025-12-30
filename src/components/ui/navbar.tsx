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
  const lastToggleTimeRef = useRef<number>(0);
  const touchHandledRef = useRef<boolean>(false);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  // Close mobile menu on route change (but not on initial mount)
  const prevPathnameRef = useRef(pathname);
  useEffect(() => {
    if (prevPathnameRef.current !== pathname && isMobileMenuOpen) {
      // Use setTimeout to defer state update and avoid cascading renders
      const timer = setTimeout(() => {
        setIsMobileMenuOpen(false);
      }, 0);
      prevPathnameRef.current = pathname;
      return () => clearTimeout(timer);
    }
    prevPathnameRef.current = pathname;
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

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  // Unified toggle handler - works for both touch and click
  const handleToggle = useCallback(() => {
    const now = Date.now();
    // Very short debounce (150ms) to prevent accidental double-taps, but allow quick single taps
    if (now - lastToggleTimeRef.current < 150) {
      return;
    }
    lastToggleTimeRef.current = now;
    setIsMobileMenuOpen((prev) => !prev);
  }, []);

  // Handle touch start - immediate response on Android (fires as soon as finger touches)
  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    touchHandledRef.current = true;
    handleToggle();
    // Reset after a short delay to allow click event to be ignored
    setTimeout(() => {
      touchHandledRef.current = false;
    }, 400);
  }, [handleToggle]);

  // Handle click - only fire if not from touch event
  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    // If this click came from a touch event, ignore it
    if (touchHandledRef.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    
    e.stopPropagation();
    handleToggle();
  }, [handleToggle]);

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
                onClick={handleClick}
                onTouchStart={handleTouchStart}
                className="lg:hidden p-2 text-gray-900 hover:text-red-600 active:text-red-700 transition focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded relative"
                style={{ 
                  position: "relative", 
                  zIndex: 10000,
                  pointerEvents: "auto",
                  touchAction: "manipulation",
                  WebkitTapHighlightColor: "rgba(220, 38, 38, 0.2)",
                  userSelect: "none",
                  cursor: "pointer",
                  minWidth: "44px",
                  minHeight: "44px",
                  backgroundColor: "transparent",
                  border: "none",
                  isolation: "isolate",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  WebkitUserSelect: "none",
                  MozUserSelect: "none",
                  msUserSelect: "none",
                  outline: "none",
                  WebkitTouchCallout: "none"
                }}
                aria-label={t("aria.toggleMenu") || "Toggle menu"}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu"
                type="button"
                data-testid="mobile-menu-button"
              >
                {isMobileMenuOpen ? (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{ pointerEvents: "none" }}
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
                    style={{ pointerEvents: "none" }}
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
                aria-label="TG CALABRIA Home"
              >
                TG CALABRIA
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

      {/* Mobile Menu - Only render on client to avoid hydration errors */}
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
