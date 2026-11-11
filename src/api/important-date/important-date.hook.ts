import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseMutationResult,
  type UseQueryOptions,
  type UseQueryResult,
} from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { QueryKeyEnum } from '@/enums';
import {
  createImportantDate,
  deleteImportantDate,
  getAdminImportantDates,
  getImportantDateById,
  getMonthCalendar,
  getPublishedImportantDates,
  getUpcomingImportantDate,
  restoreImportantDate,
  updateImportantDate,
} from './important-date.api';
import {
  AdminImportantDateListResponse,
  CreateImportantDatePayload,
  ImportantDateItemType,
  MonthCalendarResponse,
  QueryAdminImportantDateParams,
  UpcomingImportantDateResponse,
  UpdateImportantDatePayload,
} from './important-date.type';

/**
 * Hook to get nearest upcoming important date for physical tear-off calendar widget
 */
export const useGetUpcomingImportantDate = (
  options?: Omit<
    UseQueryOptions<UpcomingImportantDateResponse | null, AxiosError>,
    'queryKey' | 'queryFn'
  >,
): UseQueryResult<UpcomingImportantDateResponse | null, AxiosError> => {
  return useQuery({
    queryKey: [QueryKeyEnum.GET_UPCOMING_IMPORTANT_DATE],
    queryFn: getUpcomingImportantDate,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

/**
 * Hook to get all published important dates once and cache in memory (30 minutes)
 */
export const useGetPublishedImportantDates = (
  options?: Omit<
    UseQueryOptions<ImportantDateItemType[], AxiosError>,
    'queryKey' | 'queryFn'
  >,
): UseQueryResult<ImportantDateItemType[], AxiosError> => {
  return useQuery({
    queryKey: [QueryKeyEnum.GET_IMPORTANT_DATES],
    queryFn: getPublishedImportantDates,
    staleTime: 30 * 60 * 1000, // 30 minutes in memory
    ...options,
  });
};

/**
 * Hook to get calendar for a specific month
 */
export const useGetMonthCalendar = (
  year?: number,
  month?: number,
  options?: Omit<
    UseQueryOptions<MonthCalendarResponse, AxiosError>,
    'queryKey' | 'queryFn'
  >,
): UseQueryResult<MonthCalendarResponse, AxiosError> => {
  return useQuery({
    queryKey: [QueryKeyEnum.GET_IMPORTANT_DATES_MONTH, year, month],
    queryFn: () => getMonthCalendar(year, month),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to get detail of an important date
 */
export const useGetImportantDateById = (
  id: string,
  options?: Omit<
    UseQueryOptions<ImportantDateItemType, AxiosError>,
    'queryKey' | 'queryFn'
  >,
): UseQueryResult<ImportantDateItemType, AxiosError> => {
  return useQuery({
    queryKey: [QueryKeyEnum.GET_IMPORTANT_DATE_DETAIL, id],
    queryFn: () => getImportantDateById(id),
    enabled: Boolean(id),
    ...options,
  });
};

/**
 * Admin: Hook to get list of important dates with pagination & filters
 */
export const useGetAdminImportantDates = (
  params?: QueryAdminImportantDateParams,
  options?: Omit<
    UseQueryOptions<AdminImportantDateListResponse, AxiosError>,
    'queryKey' | 'queryFn'
  >,
): UseQueryResult<AdminImportantDateListResponse, AxiosError> => {
  return useQuery({
    queryKey: [QueryKeyEnum.GET_ADMIN_IMPORTANT_DATES, params],
    queryFn: () => getAdminImportantDates(params),
    ...options,
  });
};

/**
 * Admin: Create important date mutation
 */
export const useCreateImportantDate = (
  options?: Omit<
    UseMutationOptions<
      ImportantDateItemType,
      AxiosError,
      CreateImportantDatePayload
    >,
    'mutationFn'
  >,
): UseMutationResult<
  ImportantDateItemType,
  AxiosError,
  CreateImportantDatePayload
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createImportantDate,
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeyEnum.GET_UPCOMING_IMPORTANT_DATE],
      });
      queryClient.invalidateQueries({
        queryKey: [QueryKeyEnum.GET_IMPORTANT_DATES],
      });
      queryClient.invalidateQueries({
        queryKey: [QueryKeyEnum.GET_IMPORTANT_DATES_MONTH],
      });
      queryClient.invalidateQueries({
        queryKey: [QueryKeyEnum.GET_ADMIN_IMPORTANT_DATES],
      });
      options?.onSuccess?.(...args);
    },
  });
};

/**
 * Admin: Update important date mutation
 */
export const useUpdateImportantDate = (
  options?: Omit<
    UseMutationOptions<
      ImportantDateItemType,
      AxiosError,
      { id: string; payload: UpdateImportantDatePayload }
    >,
    'mutationFn'
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateImportantDatePayload;
    }) => updateImportantDate(id, payload),
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeyEnum.GET_UPCOMING_IMPORTANT_DATE],
      });
      queryClient.invalidateQueries({
        queryKey: [QueryKeyEnum.GET_IMPORTANT_DATES_MONTH],
      });
      queryClient.invalidateQueries({
        queryKey: [QueryKeyEnum.GET_ADMIN_IMPORTANT_DATES],
      });
      queryClient.invalidateQueries({
        queryKey: [QueryKeyEnum.GET_IMPORTANT_DATE_DETAIL],
      });
      options?.onSuccess?.(...args);
    },
  });
};

/**
 * Admin: Delete important date mutation
 */
export const useDeleteImportantDate = (
  options?: Omit<
    UseMutationOptions<
      { success: boolean; message: string; id: string },
      AxiosError,
      string
    >,
    'mutationFn'
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteImportantDate(id),
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeyEnum.GET_UPCOMING_IMPORTANT_DATE],
      });
      queryClient.invalidateQueries({
        queryKey: [QueryKeyEnum.GET_IMPORTANT_DATES],
      });
      queryClient.invalidateQueries({
        queryKey: [QueryKeyEnum.GET_IMPORTANT_DATES_MONTH],
      });
      queryClient.invalidateQueries({
        queryKey: [QueryKeyEnum.GET_ADMIN_IMPORTANT_DATES],
      });
      options?.onSuccess?.(...args);
    },
  });
};

/**
 * Admin: Restore important date mutation
 */
export const useRestoreImportantDate = (
  options?: Omit<
    UseMutationOptions<ImportantDateItemType, AxiosError, string>,
    'mutationFn'
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => restoreImportantDate(id),
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeyEnum.GET_UPCOMING_IMPORTANT_DATE],
      });
      queryClient.invalidateQueries({
        queryKey: [QueryKeyEnum.GET_IMPORTANT_DATES],
      });
      queryClient.invalidateQueries({
        queryKey: [QueryKeyEnum.GET_IMPORTANT_DATES_MONTH],
      });
      queryClient.invalidateQueries({
        queryKey: [QueryKeyEnum.GET_ADMIN_IMPORTANT_DATES],
      });
      options?.onSuccess?.(...args);
    },
  });
};

