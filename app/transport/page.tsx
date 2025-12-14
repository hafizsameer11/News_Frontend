import { Metadata } from "next";
import { TransportPageClient } from "./transport-client";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";
  
  return {
    title: "Transport Information - Calabria | NEWS NEXT",
    description: "Find bus, train, taxi, and rental transport information for Calabria. Get schedules, routes, and contact information for public transportation and transport services.",
    keywords: "transport, bus, train, taxi, rental, Calabria, public transportation, schedules, routes",
    openGraph: {
      title: "Transport Information - Calabria | NEWS NEXT",
      description: "Find bus, train, taxi, and rental transport information for Calabria.",
      type: "website",
      url: `${baseUrl}/transport`,
    },
    twitter: {
      card: "summary_large_image",
      title: "Transport Information - Calabria | NEWS NEXT",
      description: "Find bus, train, taxi, and rental transport information for Calabria.",
    },
    alternates: {
      canonical: `${baseUrl}/transport`,
    },
  };
}

export default function TransportPage() {
  return <TransportPageClient />;
}

