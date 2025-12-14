"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/helpers/cn";
import { useLanguage } from "@/providers/LanguageProvider";
import { storage } from "@/lib/helpers/storage";

const SIDEBAR_COLLAPSED_KEY = "admin_sidebar_collapsed";

interface MenuItemWithTooltipProps {
  item: { href: string; labelKey: string; icon: string };
  isActive: boolean;
  isCollapsed: boolean;
  label: string;
}

function MenuItemWithTooltip({ item, isActive, isCollapsed, label }: MenuItemWithTooltipProps) {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ top: number; left: number } | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    if (isCollapsed && linkRef.current) {
      const updatePosition = () => {
        const rect = linkRef.current?.getBoundingClientRect();
        if (rect) {
          setTooltipPosition({
            top: rect.top + rect.height / 2,
            left: rect.right + 8,
          });
        }
      };
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isCollapsed]);

  return (
    <>
      <Link
        ref={linkRef}
        href={item.href}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-md transition group relative",
          isActive
            ? "bg-red-600 text-white"
            : "text-gray-300 hover:bg-gray-800 hover:text-white",
          isCollapsed && "justify-center px-2"
        )}
        title={isCollapsed ? label : undefined}
        onMouseEnter={() => isCollapsed && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <span className="flex-shrink-0 text-lg">{item.icon}</span>
        <span className={cn("transition-all duration-300 text-sm", isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100")}>
          {label}
        </span>
      </Link>
      {isCollapsed && showTooltip && tooltipPosition && typeof window !== 'undefined' && createPortal(
        <div 
          className="fixed px-3 py-1.5 bg-gray-900 text-white text-sm font-medium rounded-lg shadow-xl pointer-events-none whitespace-nowrap z-[9999] transition-all duration-200 border border-gray-700"
          style={{ 
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`,
            transform: 'translateY(-50%)',
          }}
        >
          {label}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 border-l border-t border-gray-700 rotate-45"></div>
        </div>,
        document.body
      )}
    </>
  );
}

interface BackLinkWithTooltipProps {
  isCollapsed: boolean;
  label: string;
}

function BackLinkWithTooltip({ isCollapsed, label }: BackLinkWithTooltipProps) {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ top: number; left: number } | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    if (isCollapsed && linkRef.current) {
      const updatePosition = () => {
        const rect = linkRef.current?.getBoundingClientRect();
        if (rect) {
          setTooltipPosition({
            top: rect.top + rect.height / 2,
            left: rect.right + 8,
          });
        }
      };
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isCollapsed]);

  return (
    <>
      <Link
        ref={linkRef}
        href="/"
        className={cn(
          "flex items-center gap-2 px-3 py-2 text-gray-300 hover:bg-gray-800 hover:text-white rounded-md transition group relative",
          isCollapsed && "justify-center px-2"
        )}
        title={isCollapsed ? label : undefined}
        onMouseEnter={() => isCollapsed && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <span className="flex-shrink-0 text-lg">🏠</span>
        <span className={cn("transition-all duration-300 text-sm", isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100")}>
          {label}
        </span>
      </Link>
      {isCollapsed && showTooltip && tooltipPosition && typeof window !== 'undefined' && createPortal(
        <div 
          className="fixed px-3 py-1.5 bg-gray-900 text-white text-sm font-medium rounded-lg shadow-xl pointer-events-none whitespace-nowrap z-[9999] transition-all duration-200 border border-gray-700"
          style={{ 
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`,
            transform: 'translateY(-50%)',
          }}
        >
          {label}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 border-l border-t border-gray-700 rotate-45"></div>
        </div>,
        document.body
      )}
    </>
  );
}

const adminMenuItems = [
  { href: "/admin/dashboard", labelKey: "admin.dashboard", icon: "📊" },
  { href: "/admin/analytics", labelKey: "admin.analytics", icon: "📈" },
  { href: "/admin/news", labelKey: "admin.news", icon: "📰" },
  { href: "/admin/categories", labelKey: "admin.categories", icon: "📁" },
  { href: "/admin/ads", labelKey: "admin.ads", icon: "📢" },
  { href: "/admin/users", labelKey: "admin.users", icon: "👥" },
  { href: "/admin/media", labelKey: "admin.media", icon: "🖼️" },
  { href: "/admin/chat", labelKey: "admin.chat", icon: "💬" },
  { href: "/admin/transactions", labelKey: "admin.transactions", icon: "💳" },
  { href: "/admin/newsletter", labelKey: "admin.newsletter", icon: "📧" },
  { href: "/admin/reports", labelKey: "admin.reports", icon: "📋" },
  { href: "/admin/homepage", labelKey: "admin.homepage", icon: "🏠" },
  { href: "/admin/settings", labelKey: "admin.settings", icon: "⚙️" },
];

interface AdminSidebarProps {
  showWrapper?: boolean;
  showHeader?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function AdminSidebar({ 
  showWrapper = true, 
  showHeader = true,
  isCollapsed: externalCollapsed,
  onToggleCollapse
}: AdminSidebarProps = {}) {
  const pathname = usePathname();
  const { t, language } = useLanguage();
  const [internalCollapsed, setInternalCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return storage.get(SIDEBAR_COLLAPSED_KEY) === "true";
    }
    return false;
  });

  const isCollapsed = externalCollapsed !== undefined ? externalCollapsed : internalCollapsed;

  // Detect if we're on mobile (sidebar without wrapper is used in mobile)
  const isMobile = !showWrapper;
  // On mobile, always show expanded (ignore collapsed state)
  const shouldShowCollapsed = isMobile ? false : isCollapsed;

  const handleToggleCollapse = () => {
    const newCollapsed = !isCollapsed;
    if (externalCollapsed === undefined) {
      setInternalCollapsed(newCollapsed);
      storage.set(SIDEBAR_COLLAPSED_KEY, newCollapsed.toString());
    }
    onToggleCollapse?.();
  };

  const menuContent = (
    <>
      {showHeader && (
        <div className="mb-4 flex items-center justify-between">
          <div className={cn("transition-all duration-300", shouldShowCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100")}>
            <h1 className="text-xl font-bold text-red-600">NEWS NEXT</h1>
            <p className="text-gray-400 text-xs">{t("admin.panel")}</p>
          </div>
          <button
            onClick={handleToggleCollapse}
            className={cn(
              "p-1.5 rounded-md hover:bg-gray-800 transition-all duration-200 flex-shrink-0",
              shouldShowCollapsed ? "ml-0" : "ml-auto"
            )}
            title={shouldShowCollapsed ? (language === "it" ? "Espandi" : "Expand") : (language === "it" ? "Comprimi" : "Collapse")}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {shouldShowCollapsed ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              )}
            </svg>
          </button>
        </div>
      )}

      <nav className="space-y-1 flex-1 overflow-y-auto">
        {adminMenuItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <div key={item.href} className="relative">
              <MenuItemWithTooltip
                item={item}
                isActive={isActive}
                isCollapsed={shouldShowCollapsed}
                label={t(item.labelKey)}
              />
            </div>
          );
        })}
      </nav>

      <div className="mt-4 pt-4 border-t border-gray-800">
        <BackLinkWithTooltip 
          isCollapsed={shouldShowCollapsed}
          label={t("admin.backToSite")}
        />
      </div>
    </>
  );

  if (showWrapper) {
    return (
      <aside 
        className={cn(
          "bg-gray-900 text-white min-h-screen p-4 flex flex-col transition-all duration-300 relative",
          shouldShowCollapsed ? "w-16" : "w-64"
        )}
      >
        {menuContent}
      </aside>
    );
  }

  // Mobile view - always show expanded
  return (
    <div className="space-y-1">
      <nav className="space-y-1">
        {adminMenuItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md transition",
                isActive
                  ? "bg-red-600 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              )}
            >
              <span className="flex-shrink-0 text-lg">{item.icon}</span>
              <span className="text-sm opacity-100">
                {t(item.labelKey)}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 pt-4 border-t border-gray-800">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 text-gray-300 hover:bg-gray-800 hover:text-white rounded-md transition"
        >
          <span className="flex-shrink-0 text-lg">🏠</span>
          <span className="text-sm opacity-100">
            {t("admin.backToSite")}
          </span>
        </Link>
      </div>
    </div>
  );
}



