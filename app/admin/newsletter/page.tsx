"use client";

import { NewsletterStats } from "@/components/admin/newsletter/newsletter-stats";
import { SubscriberList } from "@/components/admin/newsletter/subscriber-list";
import { SendNewsletterForm } from "@/components/admin/newsletter/send-newsletter-form";
import { useLanguage } from "@/providers/LanguageProvider";

export default function AdminNewsletterPage() {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t("admin.newsletterManagement")}</h1>
      </div>

      {/* Statistics */}
      <NewsletterStats />

      {/* Two Column Layout - Responsive */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Subscriber List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 md:p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">{t("admin.subscribers")}</h2>
          </div>
          <div className="overflow-x-auto">
            <SubscriberList />
          </div>
        </div>

        {/* Send Newsletter Form */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <SendNewsletterForm />
        </div>
      </div>
    </div>
  );
}

