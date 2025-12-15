"use client";

import { useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { ProfileForm } from "@/components/profile/profile-form";
import { PasswordForm } from "@/components/profile/password-form";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { Loading } from "@/components/ui/loading";
import { useLanguage } from "@/providers/LanguageProvider";
import { useGetMe } from "@/lib/hooks/useAuth";
import { AuthResponse } from "@/types/user.types";
import Link from "next/link";

type Tab = "profile" | "password" | "newsletter";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const { user, isLoading: authLoading } = useAuth();
  const { data: userData, isLoading: userLoading } = useGetMe();
  const { language, t } = useLanguage();

  const isLoading = authLoading || userLoading;
  const currentUser = (userData as AuthResponse | undefined)?.data?.user || user;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <Loading />
        </main>
        <Footer />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              {language === "it"
                ? "Devi essere autenticato per vedere il tuo profilo"
                : "You must be logged in to view your profile"}
            </p>
            <Link href="/login" className="text-red-600 hover:text-red-800">
              {t("auth.login")}
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              {t("profile.myProfile")}
            </h1>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("profile")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "profile"
                    ? "border-red-500 text-red-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {t("profile.title")}
              </button>
              <button
                onClick={() => setActiveTab("password")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "password"
                    ? "border-red-500 text-red-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {t("auth.password")}
              </button>
              <button
                onClick={() => setActiveTab("newsletter")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "newsletter"
                    ? "border-red-500 text-red-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {t("profile.newsletter")}
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="bg-white shadow rounded-lg p-8">
            {activeTab === "profile" && <ProfileForm />}
            {activeTab === "password" && <PasswordForm />}
            {activeTab === "newsletter" && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  {t("profile.newsletterStatus")}
                </h2>
                <p className="text-gray-600">
                  {t("profile.newsletterManagementHint")}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
