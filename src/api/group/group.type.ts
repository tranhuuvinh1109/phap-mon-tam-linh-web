export interface GroupItemType {
  id: string;
  name: string;
  description?: string | null;
  metadata?: Record<string, any> | null;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    posts?: number;
  };
}

export interface QueryGroupParams {
  search?: string;
  includeDeleted?: boolean;
  isSupportForBachThoaiPhatPhap?: boolean;
  cursor?: string;
  page?: number;
  limit?: number;
}

export interface GetGroupsResponse {
  data: GroupItemType[];
  meta?: {
    total: number;
    page?: number;
    limit?: number;
    totalPages?: number;
    nextCursor?: string | null;
    hasNextPage?: boolean;
  };
}
