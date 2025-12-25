"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { UserSidebar } from "@/components/user/user-sidebar";
import { Loading } from "@/components/ui/loading";
import { useLanguage } from "@/providers/LanguageProvider";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { storage } from "@/lib/helpers/storage";
import { cn } from "@/lib/helpers/cn";

const SIDEBAR_COLLAPSED_KEY = "user_sidebar_collapsed";

export default function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const { language } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return storage.get(SIDEBAR_COLLAPSED_KEY) === "true";
    }
    return false;
  });

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !user) {
        router.push("/login");
        return;
      }
      // Redirect non-USER roles
      if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
        router.push("/admin/dashboard");
        return;
      } else if (user.role === "EDITOR") {
        router.push("/editor/dashboard");
        return;
      } else if (user.role === "ADVERTISER") {
        router.push("/advertiser/dashboard");
        return;
      }
    }
  }, [isAuthenticated, user, isLoading, router]);

  const handleToggleCollapse = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    storage.set(SIDEBAR_COLLAPSED_KEY, newCollapsed.toString());
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (!isAuthenticated || !user || user.role !== "USER") {
    return null; // Will redirect
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Desktop Sidebar */}
      <div
        className={cn(
          "hidden lg:block transition-all duration-300 overflow-visible",
          isCollapsed ? "w-16" : "w-64"
        )}
        style={{ overflow: "visible" }}
      >
        <UserSidebar
          isCollapsed={isCollapsed}
          onToggleCollapse={handleToggleCollapse}
        />
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 flex-shrink-0 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-red-600">TG CALABRIA</h1>
              <p className="text-gray-400 text-xs">
                {language === "it" ? "Pannello Utente" : "User Panel"}
              </p>  
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-gray-400 hover:text-white p-1"
            >
              <svg
                className="w-5 h-5"
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
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <UserSidebar showWrapper={false} showHeader={false} />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header with Menu Button */}
        <div className="lg:hidden bg-white shadow-sm border-b">
          <div className="px-4 py-3 flex items-center justify-between">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 text-gray-600 hover:text-gray-900"
            >
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
            </button>
            <h1 className="text-xl font-bold text-red-600">TG CALABRIA</h1>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>
          {/* Mobile Controls Row */}
          <div className="px-4 pb-3 flex items-center justify-between gap-2 border-t border-gray-200 pt-3">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <LanguageSwitcher />
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs sm:text-sm text-gray-600 truncate hidden sm:inline">
                {language === "it" ? "Benvenuto" : "Welcome"},{" "}
                {user?.name || "User"}
              </span>
              <button
                onClick={() => {
                  logout();
                  router.push("/login");
                }}
                className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-xs sm:text-sm font-medium"
              >
                {language === "it" ? "Esci" : "Logout"}
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block bg-white shadow-sm border-b">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {language === "it" ? "Benvenuto" : "Welcome"},{" "}
                <span className="font-semibold text-gray-900">
                  {user?.name || "User"}
                </span>
              </span>
              <button
                onClick={() => {
                  logout();
                  router.push("/login");
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium"
              >
                {language === "it" ? "Esci" : "Logout"}
              </button>
            </div>
          </div>
        </div>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
