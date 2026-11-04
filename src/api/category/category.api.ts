import { API_URL } from "@/constants";
import { apiClient } from "@/lib/axios";
import {
  CategoryItemType,
  CreateCategoryPayloadType,
  UpdateCategoryPayloadType,
} from "./category.type";

/**
 * Fetch all categories from GET /categories
 */
export const getCategories = async (): Promise<CategoryItemType[]> => {
  const response = await apiClient.get<
    CategoryItemType[] | { data: CategoryItemType[] }
  >(API_URL.categories);

  // Normalize array if wrapped in { data: [...] }
  if (Array.isArray(response.data)) {
    return response.data;
  }

  if (
    response.data &&
    typeof response.data === "object" &&
    "data" in response.data &&
    Array.isArray(response.data.data)
  ) {
    return response.data.data;
  }

  return [];
};

/**
 * Create a new category via POST /categories
 */
export const createCategory = async (
  payload: CreateCategoryPayloadType
): Promise<CategoryItemType> => {
  const response = await apiClient.post<CategoryItemType>(
    API_URL.categories,
    payload
  );
  return response.data;
};

/**
 * Update an existing category via PATCH /categories/:id
 */
export const updateCategory = async (
  id: string,
  payload: UpdateCategoryPayloadType
): Promise<CategoryItemType> => {
  const response = await apiClient.patch<CategoryItemType>(
    `${API_URL.categories}/${id}`,
    payload
  );
  return response.data;
};

/**
 * Soft delete a category via DELETE /categories/:id
 */
export const deleteCategory = async (id: string): Promise<CategoryItemType> => {
  const response = await apiClient.delete<CategoryItemType>(
    `${API_URL.categories}/${id}`
  );
  return response.data;
};

/**
 * Restore a soft-deleted category via POST /categories/:id/restore
 */
export const restoreCategory = async (id: string): Promise<CategoryItemType> => {
  const response = await apiClient.post<CategoryItemType>(
    `${API_URL.categories}/${id}/restore`
  );
  return response.data;
};

/**
 * Fetch nested category tree from GET /categories/tree
 */
export const getCategoryTree = async (): Promise<CategoryItemType[]> => {
  const response = await apiClient.get<
    CategoryItemType[] | { data: CategoryItemType[] }
  >(`${API_URL.categories}/tree`);

  if (Array.isArray(response.data)) {
    return response.data;
  }

  if (
    response.data &&
    typeof response.data === "object" &&
    "data" in response.data &&
    Array.isArray((response.data as any).data)
  ) {
    return (response.data as any).data;
  }

  return [];
};

