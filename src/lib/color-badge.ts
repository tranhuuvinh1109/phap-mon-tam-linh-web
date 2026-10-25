/**
 * Color badge utility to distinguish Categories and Groups
 */

// Curated harmonious palettes with border, background, and text
const BADGE_COLOR_PALETTES = [
  "border-amber-200 bg-amber-50 text-amber-800",
  "border-sky-200 bg-sky-50 text-sky-800",
  "border-emerald-200 bg-emerald-50 text-emerald-800",
  "border-purple-200 bg-purple-50 text-purple-800",
  "border-rose-200 bg-rose-50 text-rose-800",
  "border-indigo-200 bg-indigo-50 text-indigo-800",
  "border-teal-200 bg-teal-50 text-teal-800",
  "border-orange-200 bg-orange-50 text-orange-800",
  "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-800",
  "border-cyan-200 bg-cyan-50 text-cyan-800",
  "border-violet-200 bg-violet-50 text-violet-800",
  "border-blue-200 bg-blue-50 text-blue-800",
];

// Group-specific palettes with a subtle offset to contrast nicely with categories
const GROUP_COLOR_PALETTES = [
  "border-purple-200 bg-purple-50 text-purple-800",
  "border-teal-200 bg-teal-50 text-teal-800",
  "border-orange-200 bg-orange-50 text-orange-800",
  "border-blue-200 bg-blue-50 text-blue-800",
  "border-emerald-200 bg-emerald-50 text-emerald-800",
  "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-800",
  "border-indigo-200 bg-indigo-50 text-indigo-800",
  "border-rose-200 bg-rose-50 text-rose-800",
  "border-cyan-200 bg-cyan-50 text-cyan-800",
  "border-amber-200 bg-amber-50 text-amber-800",
  "border-violet-200 bg-violet-50 text-violet-800",
];

function getDeterministicIndex(str: string, max: number): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % max;
}

/**
 * Known category slug to preferred palette map
 */
const KNOWN_CATEGORY_COLORS: Record<string, string> = {
  "bach-thoai-phat-phap": "border-amber-200 bg-amber-50 text-amber-800",
  "bach-thoai": "border-amber-200 bg-amber-50 text-amber-800",
  "khai-thi": "border-sky-200 bg-sky-50 text-sky-800",
  "niem-kinh": "border-emerald-200 bg-emerald-50 text-emerald-800",
  "kinh-sach": "border-indigo-200 bg-indigo-50 text-indigo-800",
  "ngoi-nha-nho": "border-rose-200 bg-rose-50 text-rose-800",
};

/**
 * Returns Tailwind classes for category badge
 */
export function getCategoryBadgeStyle(slugOrName?: string | null): string {
  if (!slugOrName) {
    return "border-neutral-200 bg-neutral-100 text-neutral-500";
  }

  const key = slugOrName.toLowerCase().trim();

  // Check known slugs
  if (KNOWN_CATEGORY_COLORS[key]) {
    return KNOWN_CATEGORY_COLORS[key];
  }

  // Fallback to deterministic hash for any other categories
  const idx = getDeterministicIndex(key, BADGE_COLOR_PALETTES.length);
  return BADGE_COLOR_PALETTES[idx];
}

/**
 * Returns Tailwind classes for group badge
 */
export function getGroupBadgeStyle(groupName?: string | null): string {
  if (
    !groupName ||
    groupName.trim() === "" ||
    groupName.toLowerCase() === "undefined" ||
    groupName.toLowerCase() === "không xác định"
  ) {
    return "border-neutral-200 bg-neutral-100 text-neutral-500";
  }

  const key = groupName.toLowerCase().trim();
  const idx = getDeterministicIndex(key, GROUP_COLOR_PALETTES.length);
  return GROUP_COLOR_PALETTES[idx];
}
