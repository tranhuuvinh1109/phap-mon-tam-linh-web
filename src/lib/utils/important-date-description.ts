import { stripHtml } from "./html";

const DESCRIPTION_TYPE = "important_date_description";

export interface ImportantDateDescriptionData {
  maxRepentancePrayers: string;
  maxLittleHouses: string;
  detailHtml: string;
}

interface StoredImportantDateDescription {
  type: typeof DESCRIPTION_TYPE;
  maxRepentancePrayers?: string;
  maxLittleHouses?: string;
  detailHtml?: string;
}

const normalizeQuillHtml = (html?: string | null): string => {
  if (!html) return "";
  const trimmed = html.trim();
  if (trimmed === "<p><br></p>" || trimmed === "<br>") {
    return "";
  }
  return trimmed;
};

/**
 * Parses `importantDate.description` into structured fields while remaining
 * backwards-compatible with legacy plain-text or plain-HTML descriptions.
 */
export function parseImportantDateDescription(
  raw?: string | null
): ImportantDateDescriptionData {
  if (!raw || typeof raw !== "string") {
    return {
      maxRepentancePrayers: "",
      maxLittleHouses: "",
      detailHtml: "",
    };
  }

  const trimmed = raw.trim();
  if (trimmed.startsWith("{") && trimmed.includes(DESCRIPTION_TYPE)) {
    try {
      const parsed = JSON.parse(trimmed) as Partial<StoredImportantDateDescription>;
      if (parsed && parsed.type === DESCRIPTION_TYPE) {
        return {
          maxRepentancePrayers:
            typeof parsed.maxRepentancePrayers === "string"
              ? parsed.maxRepentancePrayers
              : "",
          maxLittleHouses:
            typeof parsed.maxLittleHouses === "string" ? parsed.maxLittleHouses : "",
          detailHtml:
            typeof parsed.detailHtml === "string" ? parsed.detailHtml : "",
        };
      }
    } catch {
      // Fallback to treating raw value as regular text/HTML
    }
  }

  return {
    maxRepentancePrayers: "",
    maxLittleHouses: "",
    detailHtml: raw,
  };
}

/**
 * Serializes the optional practice fields and rich-text detail HTML into a single
 * string suitable for storing in `important_dates.description`.
 */
export function serializeImportantDateDescription(
  data: ImportantDateDescriptionData
): string {
  const maxRepentancePrayers = data.maxRepentancePrayers.trim();
  const maxLittleHouses = data.maxLittleHouses.trim();
  const detailHtml = normalizeQuillHtml(data.detailHtml);

  if (!maxRepentancePrayers && !maxLittleHouses && !detailHtml) {
    return "";
  }

  if (!maxRepentancePrayers && !maxLittleHouses) {
    return detailHtml;
  }

  const payload: StoredImportantDateDescription = {
    type: DESCRIPTION_TYPE,
    ...(maxRepentancePrayers ? { maxRepentancePrayers } : {}),
    ...(maxLittleHouses ? { maxLittleHouses } : {}),
    ...(detailHtml ? { detailHtml } : {}),
  };

  return JSON.stringify(payload);
}

/**
 * Builds a clean single-line plain-text summary for list previews.
 */
export function formatImportantDateDescriptionPreview(
  raw?: string | null
): string {
  const parsed = parseImportantDateDescription(raw);
  const parts: string[] = [];

  if (parsed.maxRepentancePrayers.trim()) {
    parts.push(
      `Lễ Phật Đại Sám Hối Văn tối đa: ${parsed.maxRepentancePrayers.trim()}`
    );
  }
  if (parsed.maxLittleHouses.trim()) {
    parts.push(`Ngôi Nhà Nhỏ có thể đốt: ${parsed.maxLittleHouses.trim()}`);
  }

  const detailText = stripHtml(parsed.detailHtml);
  if (detailText) {
    parts.push(detailText);
  }

  return parts.join(" • ");
}

