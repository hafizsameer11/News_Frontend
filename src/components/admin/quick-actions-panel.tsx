"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/providers/LanguageProvider";

interface QuickAction {
  labelKey: string;
  icon: string;
  href: string;
  color: string;
  onClick?: () => void;
}

export function QuickActionsPanel() {
  const router = useRouter();
  const { t } = useLanguage();

  const actions: QuickAction[] = [
    {
      labelKey: "admin.createNews",
      icon: "📰",
      href: "/admin/news",
      color: "bg-blue-500 hover:bg-blue-600",
      onClick: () => {
        // This will be handled by the news page
        router.push("/admin/news");
      },
    },
    {
      labelKey: "admin.createCategory",
      icon: "📁",
      href: "/admin/categories",
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      labelKey: "admin.createUser",
      icon: "👥",
      href: "/admin/users",
      color: "bg-purple-500 hover:bg-purple-600",
    },
    {
      labelKey: "admin.adManagement",
      icon: "📢",
      href: "/admin/ads",
      color: "bg-yellow-500 hover:bg-yellow-600",
    },
    {
      labelKey: "admin.transactions",
      icon: "💳",
      href: "/admin/transactions",
      color: "bg-indigo-500 hover:bg-indigo-600",
    },
    {
      labelKey: "admin.chat",
      icon: "💬",
      href: "/admin/chat",
      color: "bg-pink-500 hover:bg-pink-600",
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-900">
        {t("admin.quickActions")}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            onClick={action.onClick}
            className={`${action.color} text-white rounded-lg p-4 flex flex-col items-center justify-center gap-2 transition transform hover:scale-105 shadow-sm`}
          >
            <span className="text-3xl">{action.icon}</span>
            <span className="text-xs sm:text-sm font-medium text-center">{t(action.labelKey)}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

