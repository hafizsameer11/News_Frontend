import { useQuery } from "@tanstack/react-query";
import { searchApi, SearchFilters } from "@/lib/api/modules/search.api";

export const useSearch = (query: string, filters?: SearchFilters) => {
  return useQuery({
    queryKey: ["search", query, filters],
    queryFn: () => searchApi.search(query, filters),
    enabled: query.length >= 2, // Only search if query is at least 2 characters
  });
};

