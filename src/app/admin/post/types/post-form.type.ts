import { ContentType } from "@/enums";

export interface CreatePostFormValues {
  categoryId: string;
  contentType: ContentType;
  title: string;
  slug: string;
  description: string;
  thumbnail: File | null;
  thumbnailPreview?: string | null;
  thumbnailUrl?: string | null;
  thumbnailKey?: string | null;
  audioFile: File | null;
  audioUrl?: string | null;
  audioKey?: string | null;
  audioDuration?: number | null;
  pdfFile?: File | null;
  fileUrl?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
  content: string;
}

export type PostFormStep = 1 | 2;
