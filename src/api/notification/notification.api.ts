import { API_URL } from "@/constants";
import { apiClient } from "@/lib/axios";
import {
  BroadcastNotificationPayload,
  SendNotificationPayload,
  SendNotificationResult,
} from "./notification.type";

export const sendNotification = async (
  payload: SendNotificationPayload
): Promise<SendNotificationResult> => {
  const response = await apiClient.post<{ data: SendNotificationResult }>(
    API_URL.notificationsSend,
    payload
  );
  return response.data.data;
};

export const broadcastNotification = async (
  payload: BroadcastNotificationPayload
): Promise<SendNotificationResult> => {
  const response = await apiClient.post<{ data: SendNotificationResult }>(
    API_URL.notificationsBroadcast,
    payload
  );
  return response.data.data;
};
