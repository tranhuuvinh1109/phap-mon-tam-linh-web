/**
 * Payload for requesting S3 presigned upload URL
 */
export interface GetPresignedUploadUrlPayloadType {
  fileName: string;
  mimeType: string;
  folder?: string;
  isAttachment?: boolean;
  fileSize?: number;
  metadata?: Record<string, any>;
}

/**
 * Response structure from POST /files/presigned-upload-url
 */
export interface PresignedUploadUrlResponseType {
  uploadUrl: string;
  url: string;
  key: string;
  expiresIn: number;
  attachment?: {
    id: string;
    key: string;
    fileType?: string;
    fileSize?: number;
    metadata?: Record<string, any>;
    createdAt: string;
    updatedAt: string;
  };
}

/**
 * Result returned after successful S3 file upload
 */
export interface UploadFileResult {
  url: string;
  key: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  attachment?: any;
}
