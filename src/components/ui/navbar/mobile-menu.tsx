"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { useLanguage } from "@/providers/LanguageProvider";
import { getDashboardUrl, getRoleDisplayName, getUserInitials } from "@/lib/helpers/navbar-helpers";
import { usePathname } from "next/navigation";
import { isActiveRoute } from "@/lib/helpers/navbar-helpers";
import { getRootCategories, getSubcategories, getCategoryLevel } from "@/lib/helpers/category-helpers";
import { Category } from "@/types/category.types";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
}

export function MobileMenu({ isOpen, onClose, categories }: MobileMenuProps) {
  const { user, logout, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const [expandedCategories, setExpandedCategories] = useState(false);
  const [expandedCategoryIds, setExpandedCategoryIds] = useState<Set<string>>(new Set());

  // Get root categories for hierarchical display
  const rootCategories = useMemo(() => {
    return getRootCategories(categories);
  }, [categories]);

  const handleLogout = () => {
    logout();
    router.push("/");
    onClose();
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategoryIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  // Recursive component to render category tree
  const renderCategoryTree = (category: Category, level: number = 0): JSX.Element => {
    const categoryPath = `/category/${category.slug}`;
    const isActive = isActiveRoute(pathname, categoryPath);
    const categoryName = language === "it" ? category.nameIt : category.nameEn;
    const subcategories = getSubcategories(category.id, categories);
    const hasSubcategories = subcategories.length > 0;
    const isExpanded = expandedCategoryIds.has(category.id);
    const indent = level * 16; // 16px per level

    return (
      <div key={category.id}>
        <div
          className={`flex items-center justify-between ${
            level > 0 ? "pl-8" : ""
          }`}
          style={{ paddingLeft: `${8 + indent}px` }}
        >
          <Link
            href={categoryPath}
            onClick={onClose}
            className={`flex-1 py-3 text-sm transition ${
              isActive
                ? "text-red-600 font-semibold"
                : "text-gray-700 hover:text-red-600"
            }`}
          >
            {level > 0 && (
              <span className="text-gray-400 text-xs mr-2">└─</span>
            )}
            {categoryName}
          </Link>
          {hasSubcategories && (
            <button
              onClick={(e) => {
                e.preventDefault();
                toggleCategory(category.id);
              }}
              className="p-2 text-gray-500 hover:text-red-600 transition"
              aria-expanded={isExpanded}
            >
              <svg
                className={`w-5 h-5 transition-transform ${isExpanded ? "rotate-180" : ""}`}
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
          )}
        </div>
        {hasSubcategories && isExpanded && (
          <div className="bg-gray-50">
            {subcategories
              .sort((a, b) => a.order - b.order)
              .map((subcategory) => renderCategoryTree(subcategory, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  const userInitials = user ? getUserInitials(user.name) : "";
  const roleName = user ? getRoleDisplayName(user.role, language) : "";

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Menu Panel */}
      <div
        id="mobile-menu"
        className={`fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label={language === "it" ? "Menu di navigazione" : "Navigation menu"}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-red-600 text-white">
            <h2 className="text-lg font-bold">MENU</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-red-700 rounded transition focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Close menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 py-4">
            {/* Section 1: Navigation */}
            <div className="mb-6">
              <h3 className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                {language === "it" ? "Navigazione" : "Navigation"}
              </h3>
              <Link
                href="/"
                onClick={onClose}
                className={`block px-4 py-3 text-sm font-medium transition ${
                  pathname === "/"
                    ? "bg-red-50 text-red-600 border-l-4 border-red-600"
                    : "text-gray-900 hover:bg-gray-50"
                }`}
              >
                {language === "it" ? "Home" : "Home"}
              </Link>

              {/* Categories Accordion */}
              <div>
                <button
                  onClick={() => setExpandedCategories(!expandedCategories)}
                  className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50 transition focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-inset"
                  aria-expanded={expandedCategories}
                  aria-controls="mobile-categories-list"
                >
                  <span>{language === "it" ? "Categorie" : "Categories"}</span>
                  <svg
                    className={`w-5 h-5 transition-transform ${expandedCategories ? "rotate-180" : ""}`}
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
                {expandedCategories && (
                  <div 
                    id="mobile-categories-list" 
                    className="bg-white border-t border-gray-200" 
                    role="region" 
                    aria-label={language === "it" ? "Lista categorie" : "Categories list"}
                  >
                    {rootCategories
                      .sort((a, b) => a.order - b.order)
                      .map((category) => renderCategoryTree(category, 0))}
                  </div>
                )}
              </div>

              <Link
                href="/search"
                onClick={onClose}
                className={`block px-4 py-3 text-sm font-medium transition ${
                  isActiveRoute(pathname, "/search")
                    ? "bg-red-50 text-red-600 border-l-4 border-red-600"
                    : "text-gray-900 hover:bg-gray-50"
                }`}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  {language === "it" ? "Cerca" : "Search"}
                </span>
              </Link>
            </div>

            {/* Section 2: Features */}
            <div className="mb-6">
              <h3 className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                {language === "it" ? "Funzionalità" : "Features"}
              </h3>
              {/* <Link
                href="/tg"
                onClick={onClose}
                className="block px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50 transition"
              >
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                  {language === "it" ? "Guarda" : "Watch"}
                </span>
              </Link> */}
              <Link
                href="/weather"
                onClick={onClose}
                className="block px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50 transition"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
                    />
                  </svg>
                  {language === "it" ? "Meteo" : "Weather"}
                </span>
              </Link>
              <Link
                href="/horoscope"
                onClick={onClose}
                className="block px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50 transition"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                  {language === "it" ? "Oroscopo" : "Horoscope"}
                </span>
              </Link>
              <Link
                href="/transport"
                onClick={onClose}
                className="block px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50 transition"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                    />
                  </svg>
                  {language === "it" ? "Trasporti" : "Transport"}
                </span>
              </Link>
              <Link
                href="/report"
                onClick={onClose}
                className="block px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50 transition"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  {language === "it" ? "Segnala" : "Report"}
                </span>
              </Link>
            </div>

            {/* Section 3: User Section (if authenticated) */}
            {isAuthenticated && user && (
              <div className="mb-6">
                <h3 className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  {language === "it" ? "Account" : "Account"}
                </h3>
                {/* User Profile Card */}
                <div className="px-4 py-3 bg-gray-50 border-l-4 border-red-600">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center text-sm font-semibold relative overflow-hidden">
                      {user.avatar ? (
                        <Image
                          src={user.avatar}
                          alt={user.name}
                          width={40}
                          height={40}
                          className="w-full h-full rounded-full object-cover"
                          unoptimized={user.avatar.includes("localhost") || user.avatar.includes("127.0.0.1")}
                        />
                      ) : (
                        userInitials
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded">
                        {roleName}
                      </span>
                    </div>
                  </div>
                </div>

                <Link
                  href="/bookmarks"
                  onClick={onClose}
                  className="block px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50 transition"
                >
                  {language === "it" ? "Segnalibri" : "Bookmarks"}
                </Link>
                <Link
                  href="/profile"
                  onClick={onClose}
                  className="block px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50 transition"
                >
                  {language === "it" ? "Profilo" : "Profile"}
                </Link>
                <Link
                  href={getDashboardUrl(user.role)}
                  onClick={onClose}
                  className="block px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50 transition"
                >
                  {language === "it" ? "Dashboard" : "Dashboard"}
                </Link>
                {user.role === "USER" && (
                  <Link
                    href="/dashboard/chat"
                    onClick={onClose}
                    className="block px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50 transition"
                  >
                    {language === "it" ? "Chat" : "Chat"}
                  </Link>
                )}
                {(user.role === "ADMIN" || user.role === "SUPER_ADMIN") && (
                  <>
                    <Link
                      href="/admin/news"
                      onClick={onClose}
                      className="block px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50 transition"
                    >
                      {language === "it" ? "Gestione Notizie" : "News Management"}
                    </Link>
                    <Link
                      href="/admin/analytics"
                      onClick={onClose}
                      className="block px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50 transition"
                    >
                      {language === "it" ? "Analytics" : "Analytics"}
                    </Link>
                  </>
                )}
                {user.role === "ADVERTISER" && (
                  <>
                    <Link
                      href="/advertiser/ads"
                      onClick={onClose}
                      className="block px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50 transition"
                    >
                      {language === "it" ? "Le Mie Pubblicità" : "My Ads"}
                    </Link>
                    <Link
                      href="/advertiser/analytics"
                      onClick={onClose}
                      className="block px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50 transition"
                    >
                      {language === "it" ? "Analytics" : "Analytics"}
                    </Link>
                  </>
                )}
                {user.role === "EDITOR" && (
                  <Link
                    href="/editor"
                    onClick={onClose}
                    className="block px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50 transition"
                  >
                    {language === "it" ? "Pannello Editor" : "Editor Panel"}
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-inset"
                  aria-label={language === "it" ? "Esci" : "Logout"}
                >
                  {language === "it" ? "Esci" : "Logout"}
                </button>
              </div>
            )}

            {/* Section 4: Auth (if not authenticated) */}
            {!isAuthenticated && (
              <div className="mb-6">
                <h3 className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  {language === "it" ? "Accesso" : "Access"}
                </h3>
                <Link
                  href="/login"
                  onClick={onClose}
                  className="block px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50 transition"
                >
                  {language === "it" ? "Accedi" : "Sign in"}
                </Link>
                <Link
                  href="/register"
                  onClick={onClose}
                  className="block px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50 transition"
                >
                  {language === "it" ? "Registrati" : "Register"}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

