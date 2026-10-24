import { API_URL } from "@/constants";
import { apiClient } from "@/lib/axios";
import {
  AssignPermissionsPayloadType,
  UpgradeRolePayloadType,
  UserItemType,
} from "./user.type";

/**
 * Fetch all users via GET /users
 */
export const getUsers = async (): Promise<UserItemType[]> => {
  const response = await apiClient.get<
    UserItemType[] | { data: UserItemType[] }
  >(API_URL.users);

  const data = response.data;
  if (data && typeof data === "object" && "data" in data && Array.isArray((data as any).data)) {
    return (data as { data: UserItemType[] }).data;
  }

  if (Array.isArray(data)) {
    return data;
  }

  return [];
};

/**
 * Upgrade or change role and permissions of a user via PUT /users/upgrade-role
 */
export const upgradeUserRole = async (
  payload: UpgradeRolePayloadType
): Promise<UserItemType> => {
  try {
    const response = await apiClient.patch<
      UserItemType | { data: UserItemType }
    >(API_URL.upgradeRole, payload);

    const data = response.data;
    if (data && typeof data === "object" && "data" in data) {
      return (data as { data: UserItemType }).data;
    }
    return data as UserItemType;
  } catch (error) {
    // Fallback to PATCH if PUT is not accepted by any environment
    const response = await apiClient.patch<
      UserItemType | { data: UserItemType }
    >(API_URL.upgradeRole, payload);

    const data = response.data;
    if (data && typeof data === "object" && "data" in data) {
      return (data as { data: UserItemType }).data;
    }
    return data as UserItemType;
  }
};

/**
 * Update permissions directly for a collaborator via PUT /users/:userId/permissions
 */
export const updateCollaboratorPermissions = async (
  payload: AssignPermissionsPayloadType
): Promise<UserItemType> => {
  const response = await apiClient.put<
    UserItemType | { data: UserItemType }
  >(API_URL.userPermissions(payload.userId), {
    permissionIds: payload.permissionIds,
  });

  const data = response.data;
  if (data && typeof data === "object" && "data" in data) {
    return (data as { data: UserItemType }).data;
  }
  return data as UserItemType;
};

/**
 * Update user approval status via PATCH /users/:userId/approval
 */
export const updateApprovalStatus = async (
  payload: { userId: string; status: string }
): Promise<UserItemType> => {
  const response = await apiClient.patch<
    UserItemType | { data: UserItemType }
  >(API_URL.userApproval(payload.userId), {
    status: payload.status,
  });

  const data = response.data;
  if (data && typeof data === "object" && "data" in data) {
    return (data as { data: UserItemType }).data;
  }
  return data as UserItemType;
};

