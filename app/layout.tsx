import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/QueryProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { LanguageProvider } from "@/providers/LanguageProvider";
import { ToastProvider } from "@/components/ui/toast";
import { BreakingNewsManager } from "@/components/notifications/breaking-news-manager";
import { BehaviorTracker } from "@/components/analytics/behavior-tracker";
import { AdsWrapper } from "@/components/ads/ads-wrapper";
import { ErrorBoundary } from "@/components/error-boundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NEWS NEXT - Edizione Calabria",
  description: "Next-generation digital news platform for Calabria",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-gray-900 overflow-x-hidden max-w-full`}
        suppressHydrationWarning
      >
        <ErrorBoundary>
          <QueryProvider>
            <LanguageProvider>
              <AuthProvider>
                <ToastProvider>
                  <BehaviorTracker>
                    <AdsWrapper />
                    <BreakingNewsManager />
                    {children}
                  </BehaviorTracker>
                </ToastProvider>
              </AuthProvider>
            </LanguageProvider>
          </QueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
