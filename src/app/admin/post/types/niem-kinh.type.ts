export interface NiemKinhStepItem {
  id: string;
  title: string;
  content: string;
}

export interface NiemKinhContentData {
  type: "niem_kinh_steps";
  subtitle?: string;
  steps: NiemKinhStepItem[];
}

/**
 * Default steps matching the template shown in the daily recitation guidelines
 */
export const DEFAULT_NIEM_KINH_DATA: NiemKinhContentData = {
  type: "niem_kinh_steps",
  subtitle: "(Cho người mới bắt đầu)\n(每日功課步驟(初學者))",
  steps: [
    {
      id: "step-1",
      title: "Bước 1",
      content:
        '<p><strong style="color: rgb(122, 28, 22);">Niệm “Tịnh Khẩu Nghiệp Chân Ngôn” 7 Biến – Trang 1</strong></p><p><em style="color: rgb(194, 65, 12);">Sách Kinh (Phật Giáo Niệm Tụng Hợp Tập)</em></p>',
    },
    {
      id: "step-2",
      title: "Bước 2",
      content: "",
    },
  ],
};

/**
 * Type guard to check if an object is NiemKinhContentData
 */
export function isNiemKinhContentData(
  val: unknown
): val is NiemKinhContentData {
  if (!val || typeof val !== "object") return false;
  const obj = val as Record<string, unknown>;
  return (
    obj.type === "niem_kinh_steps" &&
    Array.isArray(obj.steps) &&
    obj.steps.every(
      (s) =>
        s &&
        typeof s === "object" &&
        typeof (s as Record<string, unknown>).title === "string"
    )
  );
}

/**
 * Safely parses string or object to NiemKinhContentData
 */
export function parseNiemKinhContent(
  content: unknown
): NiemKinhContentData | null {
  if (!content) return null;

  if (isNiemKinhContentData(content)) {
    return content;
  }

  if (typeof content === "string") {
    const trimmed = content.trim();
    if (trimmed.startsWith("{") && trimmed.includes('"niem_kinh_steps"')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (isNiemKinhContentData(parsed)) {
          return parsed;
        }
      } catch {
        return null;
      }
    }
  }

  return null;
}

/**
 * Serializes NiemKinhContentData into a JSON string
 */
export function serializeNiemKinhContent(data: NiemKinhContentData): string {
  return JSON.stringify(data);
}
