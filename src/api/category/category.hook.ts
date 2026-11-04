import {
  useMutation,
  type UseMutationOptions,
  type UseMutationResult,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query";
import { AxiosError } from "axios";

import { QueryKeyEnum } from "@/enums";
import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategoryTree,
  restoreCategory,
  updateCategory,
} from "./category.api";
import {
  CategoryItemType,
  CreateCategoryPayloadType,
  UpdateCategoryPayloadType,
} from "./category.type";

export type UseGetCategoriesOptions = Omit<
  UseQueryOptions<CategoryItemType[], AxiosError, CategoryItemType[]>,
  "queryKey" | "queryFn"
>;

/**
 * Hook to retrieve all categories for list display and client-side slug uniqueness checking
 */
export const useGetCategories = (
  options?: UseGetCategoriesOptions
): UseQueryResult<CategoryItemType[], AxiosError> => {
  return useQuery({
    queryKey: [QueryKeyEnum.GET_CATEGORIES],
    queryFn: () => getCategories(),
    staleTime: 60 * 1000, // Cache for 1 min
    ...options,
  });
};

/**
 * Hook to retrieve nested categories tree
 */
export const useGetCategoryTree = (
  options?: UseGetCategoriesOptions
): UseQueryResult<CategoryItemType[], AxiosError> => {
  return useQuery({
    queryKey: [QueryKeyEnum.GET_CATEGORIES_TREE],
    queryFn: getCategoryTree,
    staleTime: 60 * 1000,
    ...options,
  });
};

/**
 * Options type for useCreateCategory hook
 */
export type UseCreateCategoryOptions = Omit<
  UseMutationOptions<CategoryItemType, AxiosError, CreateCategoryPayloadType>,
  "mutationFn"
>;

/**
 * Mutation hook to create a new category via POST /categories
 */
export const useCreateCategory = (
  options?: UseCreateCategoryOptions
): UseMutationResult<CategoryItemType, AxiosError, CreateCategoryPayloadType> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCategory,
    ...options,
    onSuccess: (...args) => {
      // Invalidate categories query cache so list and tree are up-to-date
      queryClient.invalidateQueries({
        queryKey: [QueryKeyEnum.GET_CATEGORIES],
      });
      queryClient.invalidateQueries({
        queryKey: [QueryKeyEnum.GET_CATEGORIES_TREE],
      });
      options?.onSuccess?.(...args);
    },
  });
};

/**
 * Mutation hook to update a category via PATCH /categories/:id
 */
export const useUpdateCategory = (
  options?: Omit<
    UseMutationOptions<
      CategoryItemType,
      AxiosError,
      { id: string; payload: UpdateCategoryPayloadType }
    >,
    "mutationFn"
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCategoryPayloadType }) =>
      updateCategory(id, payload),
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeyEnum.GET_CATEGORIES],
      });
      queryClient.invalidateQueries({
        queryKey: [QueryKeyEnum.GET_CATEGORIES_TREE],
      });
      queryClient.invalidateQueries({
        queryKey: [QueryKeyEnum.GET_POSTS],
      });
      options?.onSuccess?.(...args);
    },
  });
};

/**
 * Mutation hook to delete a category via DELETE /categories/:id
 */
export const useDeleteCategory = (
  options?: Omit<
    UseMutationOptions<CategoryItemType, AxiosError, string>,
    "mutationFn"
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeyEnum.GET_CATEGORIES],
      });
      queryClient.invalidateQueries({
        queryKey: [QueryKeyEnum.GET_CATEGORIES_TREE],
      });
      queryClient.invalidateQueries({
        queryKey: [QueryKeyEnum.GET_POSTS],
      });
      options?.onSuccess?.(...args);
    },
  });
};

/**
 * Mutation hook to restore a soft-deleted category via POST /categories/:id/restore
 */
export const useRestoreCategory = (
  options?: Omit<
    UseMutationOptions<CategoryItemType, AxiosError, string>,
    "mutationFn"
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => restoreCategory(id),
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeyEnum.GET_CATEGORIES],
      });
      queryClient.invalidateQueries({
        queryKey: [QueryKeyEnum.GET_CATEGORIES_TREE],
      });
      options?.onSuccess?.(...args);
    },
  });
};

