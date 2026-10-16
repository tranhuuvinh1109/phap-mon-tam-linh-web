/**
 * Setting item data model returned from backend
 */
export interface SettingItemType {
  id: string;
  key: string;
  value?: any;
  isEnabled: boolean;
  description?: string | null;
  group?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface SettingListResponseType {
  data: SettingItemType[];
  total: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

export interface QuerySettingParams {
  search?: string;
  group?: string;
  isEnabled?: boolean;
  page?: number;
  limit?: number;
}

export interface UpdateSettingPayloadType {
  key?: string;
  value?: any;
  isEnabled?: boolean;
  description?: string;
  group?: string;
}
