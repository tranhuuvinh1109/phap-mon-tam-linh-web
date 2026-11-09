import { PostItemType } from "@/api/post";
import {
  BACH_THOAI_DEFAULT_THUMBNAIL,
  BACH_THOAI_PHAT_PHAP_ID,
  BACH_THOAI_PHAT_PHAP_SLUG,
  DEFAULT_POST_THUMBNAIL,
  KHAI_THI_DEFAULT_THUMBNAIL,
  KHAI_THI_ID,
  KHAI_THI_SLUG,
  LIST_CATEGORY_IS_POST_STEP_TYPE,
  NIEM_KINH_ID,
  NIEM_KINH_SLUG,
} from "@/constants";
import { ContentType } from "@/enums";

/**
 * Maps categoryId to its corresponding ContentType (AUDIO, VIDEO, NORMAL)
 * If categoryId or parentId is BACH_THOAI_PHAT_PHAP_ID, it will be AUDIO.
 */
export function getContentTypeByCategory(
  categoryId: string,
  parentId?: string | null
): ContentType {
  if (
    categoryId === BACH_THOAI_PHAT_PHAP_ID ||
    parentId === BACH_THOAI_PHAT_PHAP_ID
  ) {
    return ContentType.AUDIO;
  }

  return ContentType.NORMAL;
}


export function isBachThoaiPhatPhapCategory(data?: PostItemType | null): boolean {
  if (!data?.category) return false;
  return (
    data.category.id === BACH_THOAI_PHAT_PHAP_ID ||
    data.category.parentId === BACH_THOAI_PHAT_PHAP_ID ||
    data.category.slug === BACH_THOAI_PHAT_PHAP_SLUG ||
    Boolean(
      data.category.parent?.slug &&
        data.category.parent.slug === BACH_THOAI_PHAT_PHAP_SLUG
    ) ||
    isBachThoaiPhatPhap(
      data.category.id,
      data.category.slug,
      data.category.name,
      data.category.parentId || data.category.parent?.id
    )
  );
}

export function isKhaiThiCategory(data?: PostItemType | null): boolean {
  if (!data) return false;
  return Boolean(
    isKhaiThi(
      data.categoryId || data.category?.id,
      data.category?.slug,
      data.category?.name,
      data.category?.parentId || data.category?.parent?.id
    ) ||
      (data.category?.parent?.slug &&
        (data.category.parent.slug === KHAI_THI_SLUG ||
          data.category.parent.slug.includes("khai-thi"))) ||
      (data.category?.parent?.name &&
        data.category.parent.name.toLowerCase().includes("khai thị"))
  );
}

export function getAdminPostDefaultThumbnail(data?: PostItemType | null): string {
  if (isBachThoaiPhatPhapCategory(data)) {
    return BACH_THOAI_DEFAULT_THUMBNAIL;
  }
  if (isKhaiThiCategory(data)) {
    return KHAI_THI_DEFAULT_THUMBNAIL;
  }
  return DEFAULT_POST_THUMBNAIL;
}

export function getAdminPostThumbnail(data?: PostItemType | null): string {
  const defaultThumbnail = getAdminPostDefaultThumbnail(data);
  if (
    data?.thumbnailUrl &&
    data.thumbnailUrl.trim() !== "" &&
    data.thumbnailUrl !== DEFAULT_POST_THUMBNAIL
  ) {
    return data.thumbnailUrl;
  }
  return defaultThumbnail;
}

export function isBachThoaiPhatPhap(
  categoryId?: string,
  slug?: string,
  name?: string,
  parentId?: string | null
): boolean {
  if (categoryId && categoryId === BACH_THOAI_PHAT_PHAP_ID) return true;
  if (parentId && parentId === BACH_THOAI_PHAT_PHAP_ID) return true;
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

/**
 * Checks whether a category is configured as a step-by-step post type.
 * Returns true if it matches Niệm Kinh or any category listed in LIST_CATEGORY_IS_POST_STEP_TYPE.
 */
export function isPostStepType(
  categoryId?: string,
  slug?: string,
  name?: string,
  parentId?: string | null
): boolean {
  if (isNiemKinh(categoryId, slug, name)) {
    return true;
  }

  if (
    Array.isArray(LIST_CATEGORY_IS_POST_STEP_TYPE) &&
    LIST_CATEGORY_IS_POST_STEP_TYPE.length > 0
  ) {
    const matchCategory = (val?: string | null) => {
      if (!val) return false;
      const lower = val.toLowerCase().trim();
      return LIST_CATEGORY_IS_POST_STEP_TYPE.some((item) => {
        if (!item) return false;
        const itemLower = item.toLowerCase().trim();
        return itemLower === lower || lower.includes(itemLower);
      });
    };

    if (
      matchCategory(categoryId) ||
      matchCategory(slug) ||
      matchCategory(name) ||
      matchCategory(parentId)
    ) {
      return true;
    }
  }

  return false;
}

export function isPostStepTypeCategory(data?: PostItemType | null): boolean {
  if (!data?.category) return false;
  return isPostStepType(
    data.category.id,
    data.category.slug,
    data.category.name,
    data.category.parentId
  );
}

export function isKhaiThi(
  categoryId?: string,
  slug?: string,
  name?: string,
  parentId?: string | null
): boolean {
  if (categoryId && categoryId === KHAI_THI_ID) return true;
  if (parentId && parentId === KHAI_THI_ID) return true;
  if (slug && (slug === KHAI_THI_SLUG || slug.includes("khai-thi"))) return true;
  if (name && name.toLowerCase().includes("khai thị")) return true;
  return false;
}

export function allowsGroupCategory(
  categoryId?: string,
  slug?: string,
  name?: string,
  parentId?: string | null
): boolean {
  return (
    isBachThoaiPhatPhap(categoryId, slug, name, parentId) ||
    isKhaiThi(categoryId, slug, name, parentId)
  );
}

