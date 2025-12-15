import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { newsApi } from "@/lib/api/modules/news.api";
import { News } from "@/types/news.types";

const POLLING_INTERVAL = 30000; // 30 seconds
const STORAGE_KEY = "breaking_news_seen_ids";

// Get seen breaking news IDs from localStorage
const getSeenIds = (): Set<string> => {
  if (typeof window === "undefined") return new Set();
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch {
    return new Set();
  }
};

// Save seen breaking news IDs to localStorage
const saveSeenIds = (ids: Set<string>) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(ids)));
  } catch {
    // Ignore errors
  }
};

export const useBreakingNews = (enabled: boolean = true) => {
  const [seenIds, setSeenIds] = useState<Set<string>>(getSeenIds);
  const [newBreakingNews, setNewBreakingNews] = useState<News[]>([]);
  const [isPageVisible, setIsPageVisible] = useState(() => {
    if (typeof window !== "undefined") {
      return !document.hidden;
    }
    return true;
  });

  // Monitor page visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPageVisible(!document.hidden);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Fetch breaking news
  const { data } = useQuery({
    queryKey: ["breaking-news"],
    queryFn: () =>
      newsApi.getAll({
        isBreaking: "true",
        status: "PUBLISHED",
        limit: 10,
      }),
    enabled: enabled && isPageVisible,
    refetchInterval: enabled && isPageVisible ? POLLING_INTERVAL : false,
  });

  // Detect new breaking news
  useEffect(() => {
    if (!data?.data?.news) return;

    const breakingNews = data.data.news.filter((news) => news.isBreaking);
    const currentIds = new Set(breakingNews.map((news) => news.id));
    
    // Use setTimeout to defer state updates
    const timer = setTimeout(() => {
      // Use functional update to avoid dependency on seenIds
      setSeenIds((prevSeenIds) => {
        const newItems = breakingNews.filter((news) => !prevSeenIds.has(news.id));
        
        if (newItems.length > 0) {
          // Update new breaking news
          setNewBreakingNews(newItems);
          // Update seen IDs
          const updatedSeenIds = new Set([...prevSeenIds, ...currentIds]);
          saveSeenIds(updatedSeenIds);
          return updatedSeenIds;
        }
        
        return prevSeenIds;
      });
    }, 0);
    
    return () => clearTimeout(timer);
  }, [data]);

  // Clear new breaking news after it's been shown
  const clearNewBreakingNews = () => {
    setNewBreakingNews([]);
  };

  return {
    breakingNews: data?.data?.news?.filter((news) => news.isBreaking) || [],
    newBreakingNews,
    clearNewBreakingNews,
    isLoading: !data,
  };
};

