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
  getSettingById,
  getSettings,
  toggleSetting,
  updateSetting,
} from "./setting.api";
import {
  QuerySettingParams,
  SettingItemType,
  SettingListResponseType,
  UpdateSettingPayloadType,
} from "./setting.type";

export type UseGetSettingsOptions = Omit<
  UseQueryOptions<
    SettingListResponseType,
    AxiosError,
    SettingListResponseType,
    [QueryKeyEnum.GET_SETTINGS, QuerySettingParams | undefined]
  >,
  "queryKey" | "queryFn"
>;

/**
 * Hook to retrieve settings list with filters
 */
export const useGetSettings = (
  params?: QuerySettingParams,
  options?: UseGetSettingsOptions
): UseQueryResult<SettingListResponseType, AxiosError> => {
  return useQuery({
    queryKey: [QueryKeyEnum.GET_SETTINGS, params],
    queryFn: () => getSettings(params),
    staleTime: 30 * 1000,
    ...options,
  });
};

export type UseGetSettingByIdOptions = Omit<
  UseQueryOptions<
    SettingItemType | null,
    AxiosError,
    SettingItemType | null,
    [QueryKeyEnum.GET_SETTING_DETAIL, string | undefined]
  >,
  "queryKey" | "queryFn"
>;

/**
 * Hook to retrieve a single setting by ID or Key
 */
export const useGetSettingById = (
  idOrKey?: string,
  options?: UseGetSettingByIdOptions
): UseQueryResult<SettingItemType | null, AxiosError> => {
  return useQuery({
    queryKey: [QueryKeyEnum.GET_SETTING_DETAIL, idOrKey],
    queryFn: () => (idOrKey ? getSettingById(idOrKey) : null),
    enabled: !!idOrKey,
    staleTime: 60 * 1000,
    ...options,
  });
};

/**
 * Mutation hook to toggle enable/disable of a setting
 */
export const useToggleSetting = (
  options?: Omit<
    UseMutationOptions<SettingItemType, AxiosError, string>,
    "mutationFn"
  >
): UseMutationResult<SettingItemType, AxiosError, string> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleSetting,
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeyEnum.GET_SETTINGS],
      });
      options?.onSuccess?.(...args);
    },
  });
};

/**
 * Mutation hook to update a setting
 */
export const useUpdateSetting = (
  options?: Omit<
    UseMutationOptions<
      SettingItemType,
      AxiosError,
      { id: string; payload: UpdateSettingPayloadType }
    >,
    "mutationFn"
  >
): UseMutationResult<
  SettingItemType,
  AxiosError,
  { id: string; payload: UpdateSettingPayloadType }
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }) => updateSetting(id, payload),
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeyEnum.GET_SETTINGS],
      });
      options?.onSuccess?.(...args);
    },
  });
};
