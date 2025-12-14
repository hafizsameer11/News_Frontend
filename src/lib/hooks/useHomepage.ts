import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { homepageApi, CreateHomepageSectionInput, UpdateHomepageSectionInput, HomepageSectionsResponse } from "@/lib/api/modules/homepage.api";

// Get all sections (admin)
export const useHomepageSections = () => {
  return useQuery<HomepageSectionsResponse>({
    queryKey: ["homepage", "sections"],
    queryFn: () => homepageApi.getAll(),
  });
};

// Get active layout (public)
export const useHomepageLayout = () => {
  return useQuery({
    queryKey: ["homepage", "layout"],
    queryFn: () => homepageApi.getActiveLayout(),
  });
};

// Create section mutation
export const useCreateHomepageSection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateHomepageSectionInput) => homepageApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["homepage"] });
    },
  });
};

// Update section mutation
export const useUpdateHomepageSection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateHomepageSectionInput }) =>
      homepageApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["homepage"] });
    },
  });
};

// Delete section mutation
export const useDeleteHomepageSection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => homepageApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["homepage"] });
    },
  });
};

// Reorder sections mutation
export const useReorderHomepageSections = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sectionIds: string[]) => homepageApi.reorder(sectionIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["homepage"] });
    },
  });
};

