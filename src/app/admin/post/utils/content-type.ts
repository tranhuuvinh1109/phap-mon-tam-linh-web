import { PostItemType } from "@/api/post";
import {
  BACH_THOAI_PHAT_PHAP_ID,
  BACH_THOAI_PHAT_PHAP_SLUG,
  KHAI_THI_ID,
  KHAI_THI_SLUG,
  NIEM_KINH_ID,
  NIEM_KINH_SLUG,
} from "@/constants";
import { ContentType } from "@/enums";

/**
 * Maps categoryId to its corresponding ContentType (AUDIO, VIDEO, NORMAL)
 * Customize mapping rules here as business requirements evolve.
 */
export function getContentTypeByCategory(categoryId: string): ContentType {
  // Example condition: categoryId "aaaa" corresponds to AUDIO content
  if (categoryId === BACH_THOAI_PHAT_PHAP_ID) {
    return ContentType.AUDIO;
  }

  return ContentType.NORMAL;
}


export function isBachThoaiPhatPhapCategory(data?: PostItemType | null): boolean {
  if (!data?.category) return false;
  return data.category.id === BACH_THOAI_PHAT_PHAP_ID;
}

export function isBachThoaiPhatPhap(
  categoryId?: string,
  slug?: string,
  name?: string
): boolean {
  if (categoryId && categoryId === BACH_THOAI_PHAT_PHAP_ID) return true;
  if (slug && slug === BACH_THOAI_PHAT_PHAP_SLUG) return true;
  if (name) {
    const lower = name.toLowerCase();
    if (
      lower.includes("bạch thoại phật pháp") ||
      lower.includes("bach thoai phat phap")
    ) {
      return true;
    }
  }
  return false;
}

export function isNiemKinhCategory(data?: PostItemType | null): boolean {
  if (!data?.category) return false;
  return isNiemKinh(data.category.id, data.category.slug, data.category.name);
}

export function isNiemKinh(
  categoryId?: string,
  slug?: string,
  name?: string
): boolean {
  // Exclude Khai Thị if slug or name explicitly says so
  if (slug && (slug === "khai-thi" || slug.includes("khai-thi"))) return false;
  if (name && name.toLowerCase().includes("khai thị")) return false;

  if (categoryId && categoryId === NIEM_KINH_ID) return true;
  if (slug && (slug === NIEM_KINH_SLUG || slug.includes("niem-kinh"))) return true;
  if (name) {
    const lower = name.toLowerCase();
    if (lower.includes("niệm kinh") || lower.includes("niem kinh")) {
      return true;
    }
  }
  return false;
}

export function isKhaiThi(
  categoryId?: string,
  slug?: string,
  name?: string
): boolean {
  if (categoryId && categoryId === KHAI_THI_ID) return true;
  if (slug && (slug === KHAI_THI_SLUG || slug.includes("khai-thi"))) return true;
  if (name && name.toLowerCase().includes("khai thị")) return true;
  return false;
}

export function allowsGroupCategory(
  categoryId?: string,
  slug?: string,
  name?: string
): boolean {
  return isBachThoaiPhatPhap(categoryId, slug, name) || isKhaiThi(categoryId, slug, name);
}

