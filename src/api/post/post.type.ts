import { ContentType } from "@/enums";

/**
 * Payload for audio details in CreatePostDto
 */
export interface CreatePostAudioPayloadType {
  audioUrl: string;
  duration?: number;
  fileSize?: number;
  mimeType?: string;
}

/**
 * Payload for video details in CreatePostDto
 */
export interface CreatePostVideoPayloadType {
  videoUrl: string;
  duration?: number;
}

export interface CreatePostAttachmentPayloadType {
  fileUrl: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
}

/**
 * Payload for creating a new post (POST /posts)
 */
export interface CreatePostPayloadType {
  title: string;
  slug?: string;
  content?: any;
  type?: ContentType;
  thumbnailUrl?: string;
  publishedAt?: string;
  authorId?: string;
  categoryId?: string;
  groupId?: string | null;
  audio?: CreatePostAudioPayloadType;
  video?: CreatePostVideoPayloadType;
  attachment?: CreatePostAttachmentPayloadType | null;
  attachments?: CreatePostAttachmentPayloadType[];
}

/**
 * Payload for updating an existing post (PATCH /posts/:id)
 */
export type UpdatePostPayloadType = Partial<CreatePostPayloadType>;

export interface PostAudioType {
  id: string;
  postId: string;
  audioUrl: string;
  duration?: number | null;
  fileSize?: number | null;
  mimeType?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PostVideoType {
  id: string;
  postId: string;
  videoUrl: string;
  duration?: number | null;
  thumbnailUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PostAttachmentType {
  id: string;
  postId: string;
  fileUrl: string;
  fileName?: string | null;
  fileSize?: number | null;
  mimeType?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PostCategoryType {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface PostAuthorType {
  id: string;
  name: string;
  slug: string;
  avatarUrl?: string | null;
  bio?: string | null;
  userId?: string | null;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface PostGroupType {
  id: string;
  name: string;
  description?: string | null;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface PostItemType {
  id: string;
  title: string;
  slug: string;
  content?: any;
  type: ContentType;
  thumbnailUrl?: string | null;
  publishedAt?: string | null;
  authorId?: string | null;
  categoryId?: string | null;
  groupId?: string | null;
  author?: PostAuthorType | null;
  category?: PostCategoryType | null;
  group?: PostGroupType | null;
  audio?: PostAudioType | null;
  video?: PostVideoType | null;
  attachment?: PostAttachmentType | null;
  attachments?: PostAttachmentType[];
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GetPostsMetaType {
  total: number;
  limit: number;
  nextCursor?: string | null;
  hasNextPage?: boolean;
  page?: number;
  totalPages?: number;
}

export interface GetPostsResponse {
  data: PostItemType[];
  meta?: GetPostsMetaType;
}

export interface GetPostsByCategoryParams {
  category_id?: string;
  category_name?: string;
  groupId?: string;
  group_id?: string;
  limit?: number;
  cursor?: string | null;
  page?: number;
  [key: string]: any;
}

export type GetPostsByCategoryResponse = GetPostsResponse;

export interface SearchPostsParams {
  id?: string;
  slug?: string;
  category?: string;
  categoryId?: string;
  category_id?: string;
  category_name?: string;
  categoryName?: string;
  groupId?: string;
  group_id?: string;
  search?: string;
  q?: string;
  cursor?: string | null;
  limit?: number;
  page?: number;
  publishedOnly?: boolean;
  type?: ContentType;
}

export type SearchPostsResponse = GetPostsResponse;

export type CreatePostResponseType = PostItemType;
