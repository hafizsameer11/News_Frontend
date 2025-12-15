import { Metadata } from "next";
import { SportsPageClient } from "./sports-client";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";
  
  return {
    title: "Sports - Football Videos & Standings | NEWS NEXT",
    description: "Watch football highlights and check league standings. Get the latest sports videos and team statistics.",
    keywords: "sports, football, soccer, highlights, videos, standings, league, teams, matches",
    openGraph: {
      title: "Sports - Football Videos & Standings | NEWS NEXT",
      description: "Watch football highlights and check league standings.",
      type: "website",
      url: `${baseUrl}/sports`,
    },
    twitter: {
      card: "summary_large_image",
      title: "Sports - Football Videos & Standings | NEWS NEXT",
      description: "Watch football highlights and check league standings.",
    },
    alternates: {
      canonical: `${baseUrl}/sports`,
    },
  };
}

export default function SportsPage() {
  return <SportsPageClient />;
}

