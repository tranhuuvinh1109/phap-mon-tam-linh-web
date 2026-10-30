import { ContentType, ApprovalStatusEnum } from "@/enums";

export { ApprovalStatusEnum };
export type PostApprovalStatus = ApprovalStatusEnum | "PENDING" | "APPROVED" | "REJECTED";

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

export interface ApprovePostPayloadType {
  isVerifiedFromOrigin?: boolean;
}

export interface RejectPostPayloadType {
  rejectReason: string;
}

export interface VerifyPostPayloadType {
  isVerifiedFromOrigin: boolean;
}

export interface PendingPostsCountResponse {
  count: number;
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
  status?: PostApprovalStatus;
  isVerifiedFromOrigin?: boolean;
  audio?: CreatePostAudioPayloadType;
  video?: CreatePostVideoPayloadType;
  attachment?: CreatePostAttachmentPayloadType | null;
  attachments?: CreatePostAttachmentPayloadType[];
}

/**
 * Payload for updating an existing post (PATCH /posts/:id)
 */
export interface UpdatePostPayloadType extends Partial<CreatePostPayloadType> {
  rejectReason?: string | null;
}

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
  status: PostApprovalStatus;
  isVerifiedFromOrigin: boolean;
  rejectReason?: string | null;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GetPostsParams {
  id?: string;
  slug?: string;
  category?: string;
  categoryId?: string;
  category_id?: string;
  groupId?: string;
  group_id?: string;
  type?: ContentType;
  authorId?: string;
  status?: PostApprovalStatus | "ALL";
  isVerifiedFromOrigin?: boolean;
  publishedOnly?: boolean;
  includeDeleted?: boolean;
  cursor?: string | null;
  page?: number;
  limit?: number;
  search?: string;
  q?: string;
  startDate?: string;
  endDate?: string;
  fromDate?: string;
  toDate?: string;
  [key: string]: any;
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
  status?: PostApprovalStatus | "ALL";
  isVerifiedFromOrigin?: boolean;
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
  status?: PostApprovalStatus | "ALL";
  isVerifiedFromOrigin?: boolean;
  publishedOnly?: boolean;
  type?: ContentType;
  startDate?: string;
  endDate?: string;
  fromDate?: string;
  toDate?: string;
}

export type SearchPostsResponse = GetPostsResponse;

export type CreatePostResponseType = PostItemType;
