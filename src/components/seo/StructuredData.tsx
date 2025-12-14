"use client";

import { useEffect } from "react";
import { StructuredData as StructuredDataType } from "@/types/seo.types";

interface StructuredDataProps {
  data: StructuredDataType;
  id?: string;
}

/**
 * Component for injecting JSON-LD structured data into pages
 * Can be used in both server and client components
 */
export function StructuredData({ data, id = "structured-data" }: StructuredDataProps) {
  useEffect(() => {
    // Remove existing script if present
    const existingScript = document.getElementById(id);
    if (existingScript) {
      existingScript.remove();
    }

    // Create new script element
    const script = document.createElement("script");
    script.id = id;
    script.type = "application/ld+json";
    script.text = JSON.stringify(data, null, 0);
    script.setAttribute("data-testid", "structured-data");

    // Append to head
    document.head.appendChild(script);

    // Cleanup function
    return () => {
      const scriptToRemove = document.getElementById(id);
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [data, id]);

  return null;
}

