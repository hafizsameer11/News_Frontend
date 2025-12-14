"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { useLanguage } from "@/providers/LanguageProvider";
import { AdCreationWizard } from "@/components/advertiser/ad-creation-wizard";
import { Loading } from "@/components/ui/loading";
import Link from "next/link";

export default function CreateAdPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { language } = useLanguage();

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "ADVERTISER") {
      router.push("/login");
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.role !== "ADVERTISER") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  const handleComplete = (adId: string) => {
    // Payment flow will handle redirect
    // This is just a fallback
    router.push("/advertiser/dashboard");
  };

  const handleCancel = () => {
    router.push("/advertiser/dashboard");
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600">
        <Link
          href="/advertiser/dashboard"
          className="hover:text-gray-900 transition"
        >
          {language === "it" ? "Dashboard" : "Dashboard"}
        </Link>
        <span>/</span>
        <Link
          href="/advertiser/ads"
          className="hover:text-gray-900 transition"
        >
          {language === "it" ? "I Miei Annunci" : "My Ads"}
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">
          {language === "it" ? "Crea Nuovo Annuncio" : "Create New Ad"}
        </span>
      </nav>

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {language === "it" ? "Crea Nuovo Annuncio" : "Create New Ad"}
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          {language === "it"
            ? "Compila il modulo seguente per creare un nuovo annuncio pubblicitario"
            : "Fill out the form below to create a new advertising campaign"}
        </p>
      </div>

      {/* Wizard */}
      <AdCreationWizard onComplete={handleComplete} onCancel={handleCancel} />
    </div>
  );
}

