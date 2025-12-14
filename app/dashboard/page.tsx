"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { useLanguage } from "@/providers/LanguageProvider";
import Link from "next/link";
import { Loading } from "@/components/ui/loading";

export default function UserDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const { language, t } = useLanguage();

  useEffect(() => {
    // Don't redirect while loading
    if (isLoading) {
      return;
    }

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    // Redirect based on role
    if (user) {
      if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
        router.push("/admin/dashboard");
        return;
      } else if (user.role === "EDITOR") {
        router.push("/editor");
        return;
      } else if (user.role === "ADVERTISER") {
        router.push("/advertiser/dashboard");
        return;
      }
    }
  }, [isAuthenticated, user, router, isLoading]);

  // Show loading while checking auth state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  // If not authenticated, show nothing (redirect will happen)
  if (!isAuthenticated) {
    return null;
  }

  // If user exists but not USER role, show nothing (redirect will happen)
  if (user && user.role !== "USER") {
    return null;
  }

  // If no user yet but authenticated, show loading
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {language === "it" ? "La Mia Dashboard" : "My Dashboard"}
              </h1>
              <p className="text-sm text-gray-600">
                {language === "it"
                  ? `Benvenuto, ${user.name}`
                  : `Welcome, ${user.name}`}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  logout();
                  router.push("/login");
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                {language === "it" ? "Esci" : "Logout"}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8 md:p-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              {language === "it" ? "Benvenuto su NEWS NEXT" : "Welcome to NEWS NEXT"}
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              {language === "it"
                ? "Il tuo account è stato creato con successo. Esplora le ultime notizie e rimani aggiornato."
                : "Your account has been created successfully. Explore the latest news and stay updated."}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center flex-wrap mt-8">
            <Link
              href="/"
              className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              {language === "it" ? "Esplora Notizie" : "Explore News"}
            </Link>
            <Link
              href="/dashboard/chat"
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {language === "it" ? "Chat con Admin" : "Chat with Admin"}
            </Link>
            <Link
              href="/register"
              className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition font-medium shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {language === "it" ? "Diventa Inserzionista" : "Become an Advertiser"}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

