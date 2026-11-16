import {
  BACH_THOAI_PHAT_PHAP_ID,
  BACH_THOAI_PHAT_PHAP_SLUG,
  KHAI_THI_ID,
  KHAI_THI_SLUG,
  NIEM_KINH_ID,
  NIEM_KINH_SLUG,
  NGOI_NHA_NHO_ID,
  NGOI_NHA_NHO_SLUG,
  PHONG_SINH_ID,
  PHONG_SINH_SLUG,
  THAP_HUONG_BAN_THO_PHAT_ID,
  THAP_HUONG_BAN_THO_PHAT_SLUG,
} from "@/constants";
import type { CategoryItemType } from "@/api/category/category.type";

/**
 * Checks whether a string is a standard 36-character UUID
 */
export const isUuid = (val?: string): boolean =>
  Boolean(
    val &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val)
  );

/**
 * Known static slug-to-ID mappings for instant, synchronous resolution
 */
export const KNOWN_CATEGORY_SLUG_TO_ID_MAP: Record<string, string> = {
  [BACH_THOAI_PHAT_PHAP_SLUG]: BACH_THOAI_PHAT_PHAP_ID,
  [KHAI_THI_SLUG]: KHAI_THI_ID,
  [NIEM_KINH_SLUG]: NIEM_KINH_ID,
  [NGOI_NHA_NHO_SLUG]: NGOI_NHA_NHO_ID,
  [PHONG_SINH_SLUG]: PHONG_SINH_ID,
  [THAP_HUONG_BAN_THO_PHAT_SLUG]: THAP_HUONG_BAN_THO_PHAT_ID,
};

/**
 * Resolves any category identifier (UUID, slug, or name) to a valid UUID if possible.
 * 1. If it's already a valid UUID -> returns it directly.
 * 2. If it's a known static slug constant (e.g. bach-thoai-phat-phap) -> returns its UUID immediately.
 * 3. If found in the provided categories list -> returns category.id.
 * 4. Otherwise -> returns undefined.
 */
export function resolveToCategoryId(
  val?: string,
  categories: CategoryItemType[] = []
): string | undefined {
  if (!val) return undefined;
  const trimmed = val.trim();
  if (!trimmed) return undefined;

  // 1. Direct UUID
  if (isUuid(trimmed)) return trimmed;

  const lower = trimmed.toLowerCase();

  // 2. Static constant map
  if (KNOWN_CATEGORY_SLUG_TO_ID_MAP[lower]) {
    return KNOWN_CATEGORY_SLUG_TO_ID_MAP[lower];
  }

  // 3. Dynamic lookup from categories list
  if (categories.length > 0) {
    const found = categories.find(
      (c) =>
        c.id === trimmed ||
        c.slug === trimmed ||
        c.slug?.toLowerCase() === lower ||
        c.name?.toLowerCase() === lower
    );
    if (found?.id) return found.id;
  }

  return undefined;
}

/**
 * Builds category query params prioritizing categoryId over category slug.
 */
export function buildCategoryQueryParams(
  categoryInput?: string,
  categories: CategoryItemType[] = []
): { categoryId?: string; category?: string } {
  if (!categoryInput) return {};

  const resolvedId = resolveToCategoryId(categoryInput, categories);

  if (resolvedId) {
    return { categoryId: resolvedId, category: undefined };
  }

  return { categoryId: undefined, category: categoryInput };
}
