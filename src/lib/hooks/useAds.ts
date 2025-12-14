import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adsApi } from "@/lib/api/modules/ads.api";
import { UpdateAdInput, AdResponse } from "@/types/ads.types";

// Get all ads
export const useAds = (params?: {
  page?: number;
  limit?: number;
  status?: string;
  type?: string;
}) => {
  return useQuery<AdResponse>({
    queryKey: ["ads", params],
    queryFn: () => adsApi.getAll(params),
    staleTime: 0, // Always consider data stale to ensure fresh fetches
    refetchOnMount: true, // Always refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });
};

// Create ad mutation
export const useCreateAd = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adsApi.create,
    onSuccess: () => {
      // Invalidate and refetch all ads queries (including all param variations)
      queryClient.invalidateQueries({
        queryKey: ["ads"],
        refetchType: "active",
        exact: false // Match all queries starting with ["ads"]
      });
    },
  });
};

// Update ad mutation
export const useUpdateAd = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAdInput }) => adsApi.update(id, data),
    onSuccess: () => {
      // Invalidate and refetch all ads queries (including all param variations)
      queryClient.invalidateQueries({
        queryKey: ["ads"],
        refetchType: "active",
        exact: false // Match all queries starting with ["ads"]
      });
    },
  });
};

// Delete ad mutation
export const useDeleteAd = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adsApi.delete,
    onSuccess: () => {
      // Invalidate and refetch all ads queries (including all param variations)
      queryClient.invalidateQueries({
        queryKey: ["ads"],
        refetchType: "active",
        exact: false // Match all queries starting with ["ads"]
      });
    },
  });
};

// Create payment intent mutation
export const useCreatePayment = () => {
  return useMutation({
    mutationFn: adsApi.createPayment,
  });
};

// Get ad by slot (supports multiple ads)
export const useAdBySlot = (slot: string, limit: number = 2) => {
  return useQuery({
    queryKey: ["ads", "slot", slot, limit],
    queryFn: () => adsApi.getBySlot(slot, limit),
    staleTime: 1000 * 60 * 5, // 5 minutes - ads don't change frequently
    refetchInterval: 1000 * 60 * 10, // Refetch every 10 minutes
  });
};

// Get ad by type (for TICKER, SLIDER, POPUP, STICKY ad types)
export const useAdByType = (type: string, limit: number = 2) => {
  return useQuery({
    queryKey: ["ads", "type", type, limit],
    queryFn: () => adsApi.getByType(type, limit),
    staleTime: 1000 * 60 * 5, // 5 minutes - ads don't change frequently
    refetchInterval: 1000 * 60 * 10, // Refetch every 10 minutes
  });
};

// Track impression mutation
export const useTrackImpression = () => {
  return useMutation({
    mutationFn: adsApi.trackImpression,
  });
};

// Track click mutation
export const useTrackClick = () => {
  return useMutation({
    mutationFn: adsApi.trackClick,
  });
};

// Get ad analytics
export const useAdAnalytics = (id: string) => {
  return useQuery({
    queryKey: ["ads", "analytics", id],
    queryFn: () => adsApi.getAnalytics(id),
    enabled: !!id,
  });
};

// Get advertiser analytics
export const useAdvertiserAnalytics = () => {
  return useQuery({
    queryKey: ["ads", "analytics", "me"],
    queryFn: () => adsApi.getAdvertiserAnalytics(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 10, // Refetch every 10 minutes
  });
};

