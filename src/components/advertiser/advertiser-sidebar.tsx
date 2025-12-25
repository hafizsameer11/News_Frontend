"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/helpers/cn";
import { useLanguage } from "@/providers/LanguageProvider";
import { storage } from "@/lib/helpers/storage";

const ADVERTISER_SIDEBAR_COLLAPSED_KEY = "advertiser_sidebar_collapsed";

interface MenuItemWithTooltipProps {
  item: { href: string; label: string; labelIt: string; icon: string };
  isActive: boolean;
  isCollapsed: boolean;
  label: string;
}

function MenuItemWithTooltip({
  item,
  isActive,
  isCollapsed,
  label,
}: MenuItemWithTooltipProps) {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
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
      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);
      return () => {
        window.removeEventListener("scroll", updatePosition, true);
        window.removeEventListener("resize", updatePosition);
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
        <span
          className={cn(
            "transition-all duration-300 text-sm",
            isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
          )}
        >
          {label}
        </span>
      </Link>
      {isCollapsed &&
        showTooltip &&
        tooltipPosition &&
        typeof window !== "undefined" &&
        createPortal(
          <div
            className="fixed px-3 py-1.5 bg-gray-900 text-white text-sm font-medium rounded-lg shadow-xl pointer-events-none whitespace-nowrap z-[9999] transition-all duration-200 border border-gray-700"
            style={{
              top: `${tooltipPosition.top}px`,
              left: `${tooltipPosition.left}px`,
              transform: "translateY(-50%)",
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
  const [tooltipPosition, setTooltipPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
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
      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);
      return () => {
        window.removeEventListener("scroll", updatePosition, true);
        window.removeEventListener("resize", updatePosition);
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
        <span
          className={cn(
            "transition-all duration-300 text-sm",
            isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
          )}
        >
          {label}
        </span>
      </Link>
      {isCollapsed &&
        showTooltip &&
        tooltipPosition &&
        typeof window !== "undefined" &&
        createPortal(
          <div
            className="fixed px-3 py-1.5 bg-gray-900 text-white text-sm font-medium rounded-lg shadow-xl pointer-events-none whitespace-nowrap z-[9999] transition-all duration-200 border border-gray-700"
            style={{
              top: `${tooltipPosition.top}px`,
              left: `${tooltipPosition.left}px`,
              transform: "translateY(-50%)",
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

const advertiserMenuItems = [
  {
    href: "/advertiser/dashboard",
    label: "Dashboard",
    labelIt: "Dashboard",
    icon: "📊",
  },
  {
    href: "/advertiser/ads",
    label: "My Ads",
    labelIt: "I Miei Annunci",
    icon: "📢",
  },
  {
    href: "/advertiser/ads/create",
    label: "Create Ad",
    labelIt: "Crea Annuncio",
    icon: "➕",
  },
  {
    href: "/advertiser/analytics",
    label: "Analytics",
    labelIt: "Analisi",
    icon: "📈",
  },
  {
    href: "/advertiser/transactions",
    label: "Transactions",
    labelIt: "Transazioni",
    icon: "💳",
  },
  { href: "/advertiser/chat", label: "Chat", labelIt: "Chat", icon: "💬" },
];

interface AdvertiserSidebarProps {
  showWrapper?: boolean;
  showHeader?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function AdvertiserSidebar({
  showWrapper = true,
  showHeader = true,
  isCollapsed: externalCollapsed,
  onToggleCollapse,
}: AdvertiserSidebarProps = {}) {
  const pathname = usePathname();
  const { language } = useLanguage();
  const [internalCollapsed, setInternalCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return storage.get(ADVERTISER_SIDEBAR_COLLAPSED_KEY) === "true";
    }
    return false;
  });

  const isCollapsed =
    externalCollapsed !== undefined ? externalCollapsed : internalCollapsed;

  const handleToggleCollapse = () => {
    const newCollapsed = !isCollapsed;
    if (externalCollapsed === undefined) {
      setInternalCollapsed(newCollapsed);
      storage.set(ADVERTISER_SIDEBAR_COLLAPSED_KEY, newCollapsed.toString());
    }
    onToggleCollapse?.();
  };

  const menuContent = (
    <>
      {showHeader && (
        <div className="mb-4 flex items-center justify-between">
          <div
            className={cn(
              "transition-all duration-300",
              isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
            )}
          >
            <h1 className="text-xl font-bold text-red-600">TG CALABRIA</h1>
            <p className="text-gray-400 text-xs">
              {language === "it"
                ? "Pannello Inserzionista"
                : "Advertiser Panel"}
            </p>
          </div>
          <button
            onClick={handleToggleCollapse}
            className={cn(
              "p-1.5 rounded-md hover:bg-gray-800 transition-all duration-200 flex-shrink-0",
              isCollapsed ? "ml-0" : "ml-auto"
            )}
            title={
              isCollapsed
                ? language === "it"
                  ? "Espandi"
                  : "Expand"
                : language === "it"
                ? "Comprimi"
                : "Collapse"
            }
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isCollapsed ? (
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

      <nav className="space-y-1 overflow-y-auto flex-1">
        {advertiserMenuItems.map((item) => {
          const isExactMatch = pathname === item.href;
          const isChildRoute = pathname?.startsWith(item.href + "/");

          // Find the most specific matching route
          // Sort items by length (longest first) to prioritize more specific routes
          const sortedItems = [...advertiserMenuItems].sort(
            (a, b) => b.href.length - a.href.length
          );
          const mostSpecificMatch = sortedItems.find(
            (otherItem) =>
              pathname === otherItem.href ||
              pathname?.startsWith(otherItem.href + "/")
          );

          // Only mark as active if this is the most specific match
          const isActive = mostSpecificMatch?.href === item.href;
          const label = language === "it" ? item.labelIt : item.label;

          return (
            <MenuItemWithTooltip
              key={item.href}
              item={item}
              isActive={isActive}
              isCollapsed={isCollapsed}
              label={label}
            />
          );
        })}
      </nav>

      <div className="mt-4 pt-4 border-t border-gray-800">
        <BackLinkWithTooltip
          isCollapsed={isCollapsed}
          label={language === "it" ? "Torna al Sito" : "Back to Site"}
        />
      </div>
    </>
  );

  if (showWrapper) {
    return (
      <aside
        className={cn(
          "bg-gray-900 text-white min-h-screen p-4 flex flex-col transition-all duration-300",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        {menuContent}
      </aside>
    );
  }

  return <>{menuContent}</>;
}
