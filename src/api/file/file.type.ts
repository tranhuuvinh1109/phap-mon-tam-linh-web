/**
 * Payload for requesting S3 presigned upload URL
 */
export interface GetPresignedUploadUrlPayloadType {
  fileName: string;
  mimeType: string;
  folder?: string;
}

/**
 * Response structure from POST /files/presigned-upload-url
 */
export interface PresignedUploadUrlResponseType {
  uploadUrl: string;
  url: string;
  key: string;
  expiresIn: number;
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
}
