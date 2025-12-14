"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useBehaviorTracking, trackPageView } from "@/lib/hooks/useBehaviorTracking";
import { useAuth } from "@/providers/AuthProvider";

interface BehaviorTrackerProps {
  children: React.ReactNode;
}

/**
 * Behavior Tracker Component
 * Automatically tracks page views and provides tracking functionality
 */
export function BehaviorTracker({ children }: BehaviorTrackerProps) {
  const pathname = usePathname();
  const { mutate: track } = useBehaviorTracking();
  const { user } = useAuth();
  const previousPathnameRef = useRef<string | null>(null);
  const userRef = useRef<{ id?: string; email?: string } | null>(null);
  const isTrackingRef = useRef<boolean>(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Update user ref when user changes
  useEffect(() => {
    userRef.current = user ? { id: user.id, email: user.email } : null;
  }, [user?.id, user?.email]);

  // Track page views on route change - only when pathname actually changes
  useEffect(() => {
    // Clear any existing debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    // Only track if pathname exists and is different from previous
    if (pathname && pathname !== previousPathnameRef.current && !isTrackingRef.current) {
      // Set tracking flag to prevent multiple simultaneous calls
      isTrackingRef.current = true;
      previousPathnameRef.current = pathname;
      
      // Debounce the tracking call to prevent rapid-fire requests
      debounceTimerRef.current = setTimeout(() => {
        // Extract additional metadata from pathname for news pages
        const metadata: Record<string, any> = {
          userId: userRef.current?.id,
          userEmail: userRef.current?.email,
          timestamp: new Date().toISOString(),
        };
        
        // Extract news ID/slug from pathname if it's a news page
        const newsMatch = pathname.match(/^\/news\/([^/]+)/);
        if (newsMatch) {
          metadata.newsSlug = newsMatch[1];
        }
        
        trackPageView(track, pathname, metadata);
        
        // Reset tracking flag after a short delay
        setTimeout(() => {
          isTrackingRef.current = false;
        }, 1000);
      }, 300); // 300ms debounce
    }
    
    // Cleanup function
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]); // Only depend on pathname to prevent infinite loops

  return <>{children}</>;
}

