import { API_URL } from "@/constants";
import { apiClient } from "@/lib/axios";
import { GetGroupsResponse, GroupItemType, QueryGroupParams } from "./group.type";

/**
 * Fetch all groups from GET /groups
 */
export const getGroups = async (
  params?: QueryGroupParams
): Promise<GroupItemType[]> => {
  const response = await apiClient.get<
    GetGroupsResponse | GroupItemType[]
  >(API_URL.groups, {
    params: {
      limit: 100,
      ...params,
    },
  });

  if (Array.isArray(response.data)) {
    return response.data;
  }

  if (
    response.data &&
    typeof response.data === "object" &&
    "data" in response.data &&
    Array.isArray(response.data.data)
  ) {
    return response.data.data;
  }

  return [];
};

/**
 * Fetch default undefined group from GET /groups/default
 */
export const getDefaultGroup = async (): Promise<GroupItemType> => {
  const response = await apiClient.get<GroupItemType>(
    `${API_URL.groups}/default`
  );
  return response.data;
};
