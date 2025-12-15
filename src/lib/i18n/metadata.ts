import type { Metadata } from "next";
import { getServerLanguage, tServer } from "./server";
import { cookies } from "next/headers";
import type { Language } from "./translations";

/**
 * Generate translated metadata for pages
 */
export async function generateTranslatedMetadata(
  baseMetadata: {
    title?: string;
    description?: string;
    keywords?: string;
    [key: string]: any;
  }
): Promise<Metadata> {
  const language = await getServerLanguage(cookies());

  // Use translations for metadata
  const title = baseMetadata.title || tServer("metadata.siteTitle", language);
  const description = baseMetadata.description || tServer("metadata.siteDescription", language);

  return {
    ...baseMetadata,
    title,
    description,
  };
}

/**
 * Get default metadata with language support
 */
export function getDefaultMetadata(language: Language = "en"): Metadata {
  return {
    title: tServer("metadata.siteTitle", language),
    description: tServer("metadata.siteDescription", language),
  };
}
