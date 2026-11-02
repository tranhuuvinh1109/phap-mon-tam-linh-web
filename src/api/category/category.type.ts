/**
 * Category data model based on database schema
 */
export interface CategoryItemType {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  parentId?: string | null;
  parent?: CategoryItemType | null;
  children?: CategoryItemType[];
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    posts?: number;
    children?: number;
  };
}

export type CategoryListResponseType = CategoryItemType[];

/**
 * Payload DTO for creating a new category
 */
export interface CreateCategoryPayloadType {
  name: string;
  slug?: string;
  description?: string;
  parentId?: string | null;
}

/**
 * Payload DTO for updating a category
 */
export interface UpdateCategoryPayloadType {
  name?: string;
  slug?: string;
  description?: string;
  parentId?: string | null;
}

/**
 * Form values for creating / editing category
 */
export interface CategoryFormValues {
  name: string;
  slug: string;
  description: string;
  parentId?: string | null;
}
