import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { broadcastNotification, sendNotification } from "./notification.api";
import {
  BroadcastNotificationPayload,
  SendNotificationPayload,
  SendNotificationResult,
} from "./notification.type";

export const useSendNotification = (
  options?: UseMutationOptions<
    SendNotificationResult,
    Error,
    SendNotificationPayload
  >
) => {
  return useMutation({
    mutationFn: sendNotification,
    ...options,
  });
};

export const useBroadcastNotification = (
  options?: UseMutationOptions<
    SendNotificationResult,
    Error,
    BroadcastNotificationPayload
  >
) => {
  return useMutation({
    mutationFn: broadcastNotification,
    ...options,
  });
};
