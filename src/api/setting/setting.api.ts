import { API_URL } from "@/constants";
import { apiClient } from "@/lib/axios";
import {
  QuerySettingParams,
  SettingItemType,
  SettingListResponseType,
  UpdateSettingPayloadType,
} from "./setting.type";

/**
 * Fetch settings list with optional filtering
 */
export const getSettings = async (
  params?: QuerySettingParams
): Promise<SettingListResponseType> => {
  const response = await apiClient.get<
    SettingListResponseType | SettingItemType[]
  >(API_URL.settings, {
    params,
  });

  // Normalize response
  if (Array.isArray(response.data)) {
    return {
      data: response.data,
      total: response.data.length,
    };
  }

  if (response.data && Array.isArray(response.data.data)) {
    return response.data;
  }

  return {
    data: [],
    total: 0,
  };
};

/**
 * Toggle enable/disable status for a setting
 */
export const toggleSetting = async (id: string): Promise<SettingItemType> => {
  const response = await apiClient.patch<
    { data: SettingItemType } | SettingItemType
  >(API_URL.settingToggle(id));

  if (response.data && "data" in response.data && response.data.data) {
    return response.data.data;
  }

  return response.data as SettingItemType;
};

/**
 * Update a setting
 */
export const updateSetting = async (
  id: string,
  payload: UpdateSettingPayloadType
): Promise<SettingItemType> => {
  const response = await apiClient.patch<
    { data: SettingItemType } | SettingItemType
  >(API_URL.settingById(id), payload);

  if (response.data && "data" in response.data && response.data.data) {
    return response.data.data;
  }

  return response.data as SettingItemType;
};
