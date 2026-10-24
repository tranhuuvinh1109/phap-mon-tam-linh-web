export interface SendNotificationPayload {
  userId?: string;
  userIds?: string[];
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: "default" | null;
  badge?: number;
  channelId?: string;
}

export interface BroadcastNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: "default" | null;
  badge?: number;
  channelId?: string;
}

export interface PushTicket {
  status: "ok" | "error";
  id?: string;
  message?: string;
  details?: Record<string, any>;
}

export interface SendNotificationResult {
  totalTokens: number;
  sentCount: number;
  failedCount: number;
  deactivatedCount: number;
  tickets: PushTicket[];
}
