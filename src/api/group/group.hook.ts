import {
  useQuery,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query";
import { AxiosError } from "axios";

import { QueryKeyEnum } from "@/enums";
import { getDefaultGroup, getGroups } from "./group.api";
import { GroupItemType, QueryGroupParams } from "./group.type";

export type UseGetGroupsOptions = Omit<
  UseQueryOptions<GroupItemType[], AxiosError, GroupItemType[]>,
  "queryKey" | "queryFn"
>;

/**
 * Hook to retrieve groups
 */
export const useGetGroups = (
  params?: QueryGroupParams,
  options?: UseGetGroupsOptions
): UseQueryResult<GroupItemType[], AxiosError> => {
  return useQuery({
    queryKey: [QueryKeyEnum.GET_GROUPS, params],
    queryFn: () => getGroups(params),
    staleTime: 60 * 1000,
    ...options,
  });
};

/**
 * Hook to retrieve default group
 */
export const useGetDefaultGroup = (
  options?: Omit<
    UseQueryOptions<GroupItemType, AxiosError, GroupItemType>,
    "queryKey" | "queryFn"
  >
): UseQueryResult<GroupItemType, AxiosError> => {
  return useQuery({
    queryKey: [QueryKeyEnum.GET_GROUPS, "default"],
    queryFn: getDefaultGroup,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};
