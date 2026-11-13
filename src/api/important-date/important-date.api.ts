import { API_URL } from '@/constants';
import { apiClient } from '@/lib/axios';
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
 * Fetch all published active important dates (Lightweight, cached list)
 */
export const getPublishedImportantDates = async (): Promise<ImportantDateItemType[]> => {
  const response = await apiClient.get<ImportantDateItemType[]>(
    API_URL.importantDates,
  );
  return Array.isArray(response.data) ? response.data : [];
};

/**
 * Fetch nearest upcoming important date for client widget
 */
export const getUpcomingImportantDate = async (): Promise<UpcomingImportantDateResponse | null> => {
  const response = await apiClient.get<UpcomingImportantDateResponse | null>(
    API_URL.importantDatesUpcoming,
  );
  return response.data ?? null;
};

/**
 * Fetch month calendar with solar and Vietnamese lunar days and events
 */
export const getMonthCalendar = async (
  year?: number,
  month?: number,
): Promise<MonthCalendarResponse> => {
  const response = await apiClient.get<MonthCalendarResponse>(
    API_URL.importantDatesMonth,
    {
      params: {
        ...(year && { year }),
        ...(month && { month }),
      },
    },
  );
  return response.data;
};

/**
 * Fetch important date detail by ID
 */
export const getImportantDateById = async (
  id: string,
): Promise<ImportantDateItemType> => {
  const response = await apiClient.get<ImportantDateItemType>(
    API_URL.importantDateById(id),
  );
  return response.data;
};

/**
 * Admin: Fetch important dates with pagination & filters
 */
export const getAdminImportantDates = async (
  params?: QueryAdminImportantDateParams,
): Promise<AdminImportantDateListResponse> => {
  const response = await apiClient.get<AdminImportantDateListResponse>(
    API_URL.adminImportantDates,
    { params },
  );
  return response.data;
};

/**
 * Admin: Create a new important date
 */
export const createImportantDate = async (
  payload: CreateImportantDatePayload,
): Promise<ImportantDateItemType> => {
  const response = await apiClient.post<ImportantDateItemType>(
    API_URL.adminImportantDates,
    payload,
  );
  return response.data;
};

/**
 * Admin: Update an existing important date
 */
export const updateImportantDate = async (
  id: string,
  payload: UpdateImportantDatePayload,
): Promise<ImportantDateItemType> => {
  const response = await apiClient.patch<ImportantDateItemType>(
    API_URL.adminImportantDateById(id),
    payload,
  );
  return response.data;
};

/**
 * Admin: Delete an important date
 */
export const deleteImportantDate = async (
  id: string,
): Promise<{ success: boolean; message: string; id: string }> => {
  const response = await apiClient.delete<{
    success: boolean;
    message: string;
    id: string;
  }>(API_URL.adminImportantDateById(id));
  return response.data;
};

/**
 * Admin: Restore a soft-deleted important date
 */
export const restoreImportantDate = async (
  id: string,
): Promise<ImportantDateItemType> => {
  const response = await apiClient.post<ImportantDateItemType>(
    `${API_URL.adminImportantDateById(id)}/restore`,
  );
  return response.data;
};

