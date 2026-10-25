import {
  useMutation,
  type UseMutationOptions,
  type UseMutationResult,
  useQuery,
  type UseQueryOptions,
  type UseQueryResult,
  useQueryClient,
} from "@tanstack/react-query";
import { AxiosError } from "axios";

import { QueryKeyEnum } from "@/enums";
import {
  createUser,
  getUsers,
  updateApprovalStatus,
  updateCollaboratorPermissions,
  upgradeUserRole,
} from "./user.api";
import {
  AssignPermissionsPayloadType,
  CreateUserPayloadType,
  UpdateApprovalStatusPayloadType,
  UpgradeRolePayloadType,
  UserItemType,
} from "./user.type";

export type UseCreateUserOptions = Omit<
  UseMutationOptions<UserItemType, AxiosError, CreateUserPayloadType>,
  "mutationFn"
>;

/**
 * Mutation hook to create a new user via POST /users (Admin only)
 */
export const useCreateUser = (
  options?: UseCreateUserOptions
): UseMutationResult<UserItemType, AxiosError, CreateUserPayloadType> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUser,
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeyEnum.GET_USERS],
      });
      options?.onSuccess?.(...args);
    },
  });
};

export type UseGetUsersOptions = Omit<
  UseQueryOptions<UserItemType[], AxiosError>,
  "queryKey" | "queryFn"
>;

/**
 * Query hook to fetch users list via GET /users
 */
export const useGetUsers = (
  options?: UseGetUsersOptions
): UseQueryResult<UserItemType[], AxiosError> => {
  return useQuery({
    queryKey: [QueryKeyEnum.GET_USERS],
    queryFn: getUsers,
    ...options,
  });
};

export type UseUpgradeUserRoleOptions = Omit<
  UseMutationOptions<UserItemType, AxiosError, UpgradeRolePayloadType>,
  "mutationFn"
>;

/**
 * Mutation hook to upgrade/change role and permissions via PUT /users/upgrade-role
 */
export const useUpgradeUserRole = (
  options?: UseUpgradeUserRoleOptions
): UseMutationResult<UserItemType, AxiosError, UpgradeRolePayloadType> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: upgradeUserRole,
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeyEnum.GET_USERS],
      });
      options?.onSuccess?.(...args);
    },
  });
};

export type UseUpdateCollaboratorPermissionsOptions = Omit<
  UseMutationOptions<UserItemType, AxiosError, AssignPermissionsPayloadType>,
  "mutationFn"
>;

/**
 * Mutation hook to update collaborator permissions via PUT /users/:userId/permissions
 */
export const useUpdateCollaboratorPermissions = (
  options?: UseUpdateCollaboratorPermissionsOptions
): UseMutationResult<
  UserItemType,
  AxiosError,
  AssignPermissionsPayloadType
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCollaboratorPermissions,
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeyEnum.GET_USERS],
      });
      options?.onSuccess?.(...args);
    },
  });
};

export type UseUpdateApprovalStatusOptions = Omit<
  UseMutationOptions<UserItemType, AxiosError, UpdateApprovalStatusPayloadType>,
  "mutationFn"
>;

/**
 * Mutation hook to update user approval status via PATCH /users/:userId/approval
 */
export const useUpdateApprovalStatus = (
  options?: UseUpdateApprovalStatusOptions
): UseMutationResult<
  UserItemType,
  AxiosError,
  UpdateApprovalStatusPayloadType
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateApprovalStatus,
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeyEnum.GET_USERS],
      });
      options?.onSuccess?.(...args);
    },
  });
};

