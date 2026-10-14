/**
 * Strips HTML tags and decodes common entities to return a clean excerpt.
 * Handles strings, Quill Delta objects, JSON objects, and non-string values safely.
 */
export function stripHtml(html?: unknown): string {
  if (html === null || html === undefined) return "";

  let rawString = "";

  if (typeof html === "string") {
    // Check if it's a Niem Kinh steps structure
    if (html.includes("niem_kinh_steps")) {
      try {
        const parsed = JSON.parse(html);
        if (parsed?.type === "niem_kinh_steps" && Array.isArray(parsed.steps)) {
          const parts: string[] = [];
          if (parsed.subtitle) parts.push(parsed.subtitle);
          parsed.steps.forEach((s: { title?: string; content?: string }) => {
            if (s.title) parts.push(s.title);
            if (s.content) parts.push(stripHtml(s.content));
          });
          return parts.join(" ").replace(/\s+/g, " ").trim();
        }
      } catch {
        // Fallback to normal string processing
      }
    }
    rawString = html;
  } else if (typeof html === "object") {
    // If it's a Niem Kinh steps object
    const anyObj = html as Record<string, unknown>;
    if (anyObj?.type === "niem_kinh_steps" && Array.isArray(anyObj.steps)) {
      const parts: string[] = [];
      if (typeof anyObj.subtitle === "string") parts.push(anyObj.subtitle);
      (anyObj.steps as Array<{ title?: string; content?: string }>).forEach((s) => {
        if (s.title) parts.push(s.title);
        if (s.content) parts.push(stripHtml(s.content));
      });
      return parts.join(" ").replace(/\s+/g, " ").trim();
    }

    // If it's a Quill Delta structure: { ops: [{ insert: "text" }, ...] }
    const deltaObj = html as { ops?: Array<{ insert?: unknown }> };
    if (Array.isArray(deltaObj.ops)) {
      return deltaObj.ops
        .map((op) => (typeof op.insert === "string" ? op.insert : ""))
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
    }

    try {
      rawString = JSON.stringify(html);
    } catch {
      return "";
    }
  } else {
    rawString = String(html);
  }

  if (!rawString || typeof rawString.replace !== "function") {
    return "";
  }

  return rawString
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

