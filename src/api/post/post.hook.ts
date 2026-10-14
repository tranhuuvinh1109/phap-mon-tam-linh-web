import {
  useMutation,
  type UseMutationOptions,
  type UseMutationResult,
  useQuery,
  type UseQueryOptions,
  type UseQueryResult,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { AxiosError } from "axios";

import { QueryKeyEnum } from "@/enums";
import {
  createPost,
  getPostBySlug,
  getPosts,
  getPostsByCategory,
  searchPostBySlug,
  searchPosts,
} from "./post.api";
import {
  CreatePostPayloadType,
  GetPostsByCategoryParams,
  GetPostsResponse,
  PostItemType,
  SearchPostsParams,
  SearchPostsResponse,
} from "./post.type";

export type UseCreatePostOptions = Omit<
  UseMutationOptions<PostItemType, AxiosError, CreatePostPayloadType>,
  "mutationFn"
>;

/**
 * Mutation hook to create a new post via POST /posts
 */
export const useCreatePost = (
  options?: UseCreatePostOptions
): UseMutationResult<PostItemType, AxiosError, CreatePostPayloadType> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPost,
    ...options,
    onSuccess: (...args) => {
      // Invalidate posts list queries
      queryClient.invalidateQueries({
        queryKey: [QueryKeyEnum.GET_POSTS],
      });
      options?.onSuccess?.(...args);
    },
  });
};

export type UseGetPostsOptions = Omit<
  UseQueryOptions<GetPostsResponse, AxiosError>,
  "queryKey" | "queryFn"
>;

/**
 * Query hook to fetch posts list via GET /posts
 */
export const useGetPosts = (
  params?: Record<string, any>,
  options?: UseGetPostsOptions
): UseQueryResult<GetPostsResponse, AxiosError> => {
  return useQuery({
    queryKey: [QueryKeyEnum.GET_POSTS, params],
    queryFn: () => getPosts(params),
    ...options,
  });
};

export type UseGetPostBySlugOptions = Omit<
  UseQueryOptions<PostItemType, AxiosError>,
  "queryKey" | "queryFn"
>;

/**
 * Query hook to fetch a single post by slug via GET /posts/:slug
 */
export const useGetPostBySlug = (
  slug: string,
  options?: UseGetPostBySlugOptions
): UseQueryResult<PostItemType, AxiosError> => {
  return useQuery({
    queryKey: [QueryKeyEnum.GET_POST_DETAIL, slug],
    queryFn: () => getPostBySlug(slug),
    enabled: !!slug,
    ...options,
  });
};

export type UseGetPostsByCategoryOptions = Omit<
  UseQueryOptions<GetPostsResponse, AxiosError>,
  "queryKey" | "queryFn"
>;

/**
 * Query hook to fetch posts by category via GET /posts/category
 */
export const useGetPostsByCategory = (
  params?: GetPostsByCategoryParams,
  options?: UseGetPostsByCategoryOptions
): UseQueryResult<GetPostsResponse, AxiosError> => {
  return useQuery({
    queryKey: [QueryKeyEnum.GET_POSTS_BY_CATEGORY, params],
    queryFn: () => getPostsByCategory(params),
    ...options,
  });
};

export type UseSearchPostBySlugOptions = Omit<
  UseQueryOptions<PostItemType, AxiosError>,
  "queryKey" | "queryFn"
>;

/**
 * Query hook to search post by slug via GET /posts/search?slug=:slug
 */
export const useSearchPostBySlug = (
  slug: string,
  options?: UseSearchPostBySlugOptions
): UseQueryResult<PostItemType, AxiosError> => {
  return useQuery({
    queryKey: ["posts-search-slug", slug],
    queryFn: () => searchPostBySlug(slug),
    enabled: !!slug,
    ...options,
  });
};

export type UseSearchPostsOptions = Omit<
  UseQueryOptions<SearchPostsResponse, AxiosError>,
  "queryKey" | "queryFn"
>;

/**
 * Query hook to search posts with filters (slug, category, id, keyword) via GET /posts/search
 */
export const useSearchPosts = (
  params?: SearchPostsParams,
  options?: UseSearchPostsOptions
): UseQueryResult<SearchPostsResponse, AxiosError> => {
  return useQuery({
    queryKey: ["posts-search", params],
    queryFn: () => searchPosts(params),
    ...options,
  });
};

/**
 * Infinite Query hook with cursor pagination for search posts via GET /posts/search
 */
export const useInfiniteSearchPosts = (
  params?: Omit<SearchPostsParams, "cursor">,
  options?: any
) => {
  return useInfiniteQuery<SearchPostsResponse, AxiosError>({
    queryKey: ["posts-search-infinite", params],
    queryFn: ({ pageParam }) =>
      searchPosts({
        ...params,
        cursor: pageParam as string | undefined,
      }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => {
      if (lastPage.meta?.hasNextPage && lastPage.meta?.nextCursor) {
        return lastPage.meta.nextCursor;
      }
      return undefined;
    },
    ...options,
  });
};


