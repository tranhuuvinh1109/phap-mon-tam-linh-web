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
import { getSettings, toggleSetting, updateSetting } from "./setting.api";
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
