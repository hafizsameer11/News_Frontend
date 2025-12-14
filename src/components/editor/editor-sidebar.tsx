"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/helpers/cn";
import { useLanguage } from "@/providers/LanguageProvider";
import { storage } from "@/lib/helpers/storage";

const EDITOR_SIDEBAR_COLLAPSED_KEY = "editor_sidebar_collapsed";

const editorMenuItems = [
  { href: "/editor/dashboard", label: "Dashboard", labelIt: "Dashboard", icon: "📊" },
  { href: "/editor/news", label: "My News", labelIt: "Le Mie Notizie", icon: "📰" },
  { href: "/editor/media", label: "Media Library", labelIt: "Libreria Media", icon: "🖼️" },
  { href: "/editor/chat", label: "Chat", labelIt: "Chat", icon: "💬" },
];

interface EditorSidebarProps {
  showWrapper?: boolean;
  showHeader?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function EditorSidebar({ 
  showWrapper = true, 
  showHeader = true,
  isCollapsed: externalCollapsed,
  onToggleCollapse
}: EditorSidebarProps = {}) {
  const pathname = usePathname();
  const { language, t } = useLanguage();
  const [internalCollapsed, setInternalCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return storage.get(EDITOR_SIDEBAR_COLLAPSED_KEY) === "true";
    }
    return false;
  });

  const isCollapsed = externalCollapsed !== undefined ? externalCollapsed : internalCollapsed;

  const handleToggleCollapse = () => {
    const newCollapsed = !isCollapsed;
    if (externalCollapsed === undefined) {
      setInternalCollapsed(newCollapsed);
      storage.set(EDITOR_SIDEBAR_COLLAPSED_KEY, newCollapsed.toString());
    }
    onToggleCollapse?.();
  };

  const menuContent = (
    <>
      {showHeader && (
        <div className="mb-4 flex items-center justify-between">
          <div className={cn("transition-all duration-300", isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100")}>
            <h1 className="text-xl font-bold text-red-600">NEWS NEXT</h1>
            <p className="text-gray-400 text-xs">
              {language === "it" ? "Pannello Editor" : "Editor Panel"}
            </p>
          </div>
          <button
            onClick={handleToggleCollapse}
            className={cn(
              "p-1.5 rounded-md hover:bg-gray-800 transition-all duration-200 flex-shrink-0",
              isCollapsed ? "ml-0" : "ml-auto"
            )}
            title={isCollapsed ? (language === "it" ? "Espandi" : "Expand") : (language === "it" ? "Comprimi" : "Collapse")}
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
        {editorMenuItems.map((item) => {
          const isExactMatch = pathname === item.href;
          const isChildRoute = pathname?.startsWith(item.href + "/");
          const isActive = isExactMatch || isChildRoute;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md transition group relative",
                isActive
                  ? "bg-red-600 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white",
                isCollapsed && "justify-center px-2"
              )}
              title={isCollapsed ? (language === "it" ? item.labelIt : item.label) : undefined}
            >
              <span className="flex-shrink-0 text-lg">{item.icon}</span>
              <span className={cn("transition-all duration-300 text-sm", isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100")}>
                {language === "it" ? item.labelIt : item.label}
              </span>
              {isCollapsed && (
                <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-all duration-200 border border-gray-700">
                  {language === "it" ? item.labelIt : item.label}
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 border-l border-t border-gray-700 rotate-45"></div>
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 pt-4 border-t border-gray-800">
        <Link
          href="/"
          className={cn(
            "flex items-center gap-2 px-3 py-2 text-gray-300 hover:bg-gray-800 hover:text-white rounded-md transition group relative",
            isCollapsed && "justify-center px-2"
          )}
          title={isCollapsed ? (language === "it" ? "Torna al Sito" : "Back to Site") : undefined}
        >
          <span className="flex-shrink-0 text-lg">🏠</span>
          <span className={cn("transition-all duration-300 text-sm", isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100")}>
            {language === "it" ? "Torna al Sito" : "Back to Site"}
          </span>
          {isCollapsed && (
            <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none z-50 transition-all duration-200 whitespace-nowrap border border-gray-700">
              {language === "it" ? "Torna al Sito" : "Back to Site"}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 border-l border-t border-gray-700 rotate-45"></div>
            </div>
          )}
        </Link>
      </div>
    </>
  );

  if (showWrapper) {
    return (
      <aside className={cn(
        "bg-gray-900 text-white min-h-screen p-4 flex flex-col transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}>
        {menuContent}
      </aside>
    );
  }

  return <>{menuContent}</>;
}

