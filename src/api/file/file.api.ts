import axios from "axios";

import { API_URL } from "@/constants";
import { apiClient } from "@/lib/axios";
import {
  GetPresignedUploadUrlPayloadType,
  PresignedUploadUrlResponseType,
  UploadFileResult,
} from "./file.type";

/**
 * Step 1: Request presigned upload URL from backend API
 */
export const getPresignedUploadUrl = async (
  payload: GetPresignedUploadUrlPayloadType
): Promise<PresignedUploadUrlResponseType> => {
  const response = await apiClient.post<
    PresignedUploadUrlResponseType | { data: PresignedUploadUrlResponseType }
  >(API_URL.presignedUploadUrl, payload);

  const data = response.data;
  if (data && typeof data === "object" && "data" in data) {
    return data.data;
  }

  return data as PresignedUploadUrlResponseType;
};

/**
 * Step 2: Upload file binary data directly to AWS S3 using presigned PUT URL
 * NOTE: Uses plain axios (NOT apiClient) to avoid injecting Authorization Bearer header
 * which AWS S3 would reject.
 */
export const uploadToS3 = async (
  uploadUrl: string,
  file: File,
  onProgress?: (percent: number) => void
): Promise<void> => {
  await axios.put(uploadUrl, file, {
    headers: {
      "Content-Type": file.type || "application/octet-stream",
    },
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress?.(percentCompleted);
      }
    },
  });
};

export interface UploadFileOptions {
  folder?: string;
  isAttachment?: boolean;
  metadata?: Record<string, any>;
}

/**
 * Complete workflow: Request Presigned URL -> Upload to S3 -> Return S3 URL & key
 */
export const uploadFile = async (
  file: File,
  onProgress?: (percent: number) => void,
  folder?: string,
  options?: UploadFileOptions
): Promise<UploadFileResult> => {
  // 1. Get presigned upload URL from backend
  const presigned = await getPresignedUploadUrl({
    fileName: file.name,
    mimeType: file.type || "application/octet-stream",
    folder: folder ?? options?.folder,
    isAttachment: options?.isAttachment,
    fileSize: file.size,
    metadata: options?.metadata,
  });

  // 2. Upload file to S3
  await uploadToS3(presigned.uploadUrl, file, onProgress);

  // 3. Return S3 location info
  return {
    url: presigned.url,
    key: presigned.key,
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type || "application/octet-stream",
    attachment: presigned.attachment,
  };
};
