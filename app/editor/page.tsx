"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Redirect old /editor route to new /editor/dashboard
export default function EditorPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/editor/dashboard");
  }, [router]);

  return null;
}

