"use client";

import { useAuth } from "@/providers/AuthProvider";
import { useLanguage } from "@/providers/LanguageProvider";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import Link from "next/link";

export function AdminNavbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const { t } = useLanguage();

  if (!isAuthenticated || !user) {
    return null; // Don't render if not authenticated
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="px-6 py-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">{t("admin.dashboard")}</h2>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <span className="text-gray-600">
            {t("admin.welcome")}, {user?.name || "Admin"}
          </span>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            {t("admin.logout")}
          </button>
        </div>
      </div>
    </nav>
  );
}

