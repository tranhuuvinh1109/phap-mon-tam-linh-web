import React from "react";
import { stripHtml } from "./utils/html";

/**
 * Normalizes a string by stripping Vietnamese diacritics / accents and converting to lowercase.
 * Keeps character length 1:1 with the original string so match indices align perfectly.
 */
export function stripVietnameseAccents(str: string): string {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

/**
 * Checks if the position at idx is a word boundary in the string.
 */
export function isWordBoundary(str: string, idx: number): boolean {
  if (idx <= 0 || idx >= str.length) return true;
  const before = str[idx - 1];
  const after = str[idx];
  // Check if character is Unicode letter or number
  const isAlphaNum = (c: string) => /[\p{L}\p{N}]/u.test(c);
  return !isAlphaNum(before) || !isAlphaNum(after);
}

export interface MatchRange {
  start: number;
  end: number;
}

/**
 * Locates all matching character ranges for a query inside text.
 * Matches case-insensitively and Vietnamese accent-insensitively.
 * Honors word boundaries to avoid partial syllable false positives.
 */
export function findMatchRanges(text: string, query: string): MatchRange[] {
  if (!text || !query || !query.trim()) return [];

  const normText = stripVietnameseAccents(text);
  const trimmedQuery = query.trim();
  const normQuery = stripVietnameseAccents(trimmedQuery);

  // Split query into individual words (length >= 1) and include full query
  const rawWords = normQuery.split(/\s+/).filter(Boolean);
  const searchPhrases = Array.from(new Set([normQuery, ...rawWords]));

  // Prioritize longer phrases first
  searchPhrases.sort((a, b) => b.length - a.length);

  const ranges: MatchRange[] = [];

  for (const phrase of searchPhrases) {
    if (!phrase) continue;
    let pos = 0;
    while ((pos = normText.indexOf(phrase, pos)) !== -1) {
      const matchStart = pos;
      const matchEnd = pos + phrase.length;

      // Check boundary conditions:
      // For multi-word phrase or single word, match starts and ends at word boundary
      const startAtBoundary = isWordBoundary(normText, matchStart);
      const endAtBoundary = isWordBoundary(normText, matchEnd);

      if (startAtBoundary && endAtBoundary) {
        ranges.push({ start: matchStart, end: matchEnd });
      }
      pos += phrase.length;
    }
  }

  if (ranges.length === 0) return [];

  // Sort ranges ascending by start index
  ranges.sort((a, b) => a.start - b.start);

  // Merge overlapping or adjacent ranges
  const merged: MatchRange[] = [];
  for (const r of ranges) {
    if (merged.length === 0) {
      merged.push({ ...r });
      continue;
    }
    const last = merged[merged.length - 1];
    if (r.start <= last.end) {
      last.end = Math.max(last.end, r.end);
    } else {
      merged.push({ ...r });
    }
  }

  return merged;
}

export interface HighlightedTextProps {
  text?: string | null;
  highlight?: string | null;
  className?: string;
  highlightClassName?: string;
}

export const DEFAULT_HIGHLIGHT_CLASS =
  "bg-amber-200/90 text-amber-950 font-semibold px-0.5 rounded-xs transition-colors";

/**
 * React Component to render text with matched query highlighted using <mark>.
 */
export const HighlightedText: React.FC<HighlightedTextProps> = ({
  text,
  highlight,
  className = "",
  highlightClassName = DEFAULT_HIGHLIGHT_CLASS,
}) => {
  if (!text) return null;
  if (!highlight || !highlight.trim()) {
    return <span className={className}>{text}</span>;
  }

  const ranges = findMatchRanges(text, highlight);
  if (ranges.length === 0) {
    return <span className={className}>{text}</span>;
  }

  const elements: React.ReactNode[] = [];
  let lastIndex = 0;

  ranges.forEach((range, idx) => {
    // Non-matched segment before this match
    if (range.start > lastIndex) {
      elements.push(
        <React.Fragment key={`text-${idx}`}>
          {text.slice(lastIndex, range.start)}
        </React.Fragment>
      );
    }
    // Matched highlighted segment
    elements.push(
      <mark key={`mark-${idx}`} className={highlightClassName}>
        {text.slice(range.start, range.end)}
      </mark>
    );
    lastIndex = range.end;
  });

  // Remaining segment after the last match
  if (lastIndex < text.length) {
    elements.push(
      <React.Fragment key="text-end">{text.slice(lastIndex)}</React.Fragment>
    );
  }

  return <span className={className}>{elements}</span>;
};

/**
 * Safely highlights matching keywords inside an HTML string without corrupting HTML tags or attributes.
 */
export function highlightInHtml(
  html: string,
  query: string,
  highlightClassName: string = DEFAULT_HIGHLIGHT_CLASS
): string {
  if (!html || !query || !query.trim()) return html;

  // Split HTML into HTML tags vs text nodes
  // Matches either:
  // 1) An HTML tag: <[^>]+>
  // 2) A text node: [^<]+
  return html.replace(/(<[^>]+>)|([^<]+)/g, (match, tag, textNode) => {
    if (tag) return tag;
    if (!textNode) return "";

    const ranges = findMatchRanges(textNode, query);
    if (ranges.length === 0) return textNode;

    let result = "";
    let lastIndex = 0;
    for (const r of ranges) {
      result += textNode.slice(lastIndex, r.start);
      result += `<mark class="search-highlight ${highlightClassName}">${textNode.slice(
        r.start,
        r.end
      )}</mark>`;
      lastIndex = r.end;
    }
    result += textNode.slice(lastIndex);
    return result;
  });
}

/**
 * Extracts a clean text snippet with context surrounding the first occurrence of query.
 */
export function getSnippetWithContext(
  content: unknown,
  query?: string | null,
  maxLength: number = 150
): string {
  const plainText = stripHtml(content);
  if (!plainText) return "";

  if (!query || !query.trim()) {
    return plainText.length > maxLength
      ? `${plainText.slice(0, maxLength)}...`
      : plainText;
  }

  const ranges = findMatchRanges(plainText, query);
  if (ranges.length === 0) {
    return plainText.length > maxLength
      ? `${plainText.slice(0, maxLength)}...`
      : plainText;
  }

  // Find first match
  const firstMatch = ranges[0];
  const matchLen = firstMatch.end - firstMatch.start;

  // Aim to show around 40 characters before match if possible
  const leadChars = 40;
  let startIdx = Math.max(0, firstMatch.start - leadChars);
  let endIdx = Math.min(plainText.length, startIdx + maxLength);

  // If match is near the end, adjust startIdx backward
  if (endIdx - startIdx < maxLength && startIdx > 0) {
    startIdx = Math.max(0, endIdx - maxLength);
  }

  // Adjust startIdx to word boundary if not at start
  if (startIdx > 0) {
    const nextSpace = plainText.indexOf(" ", startIdx);
    if (nextSpace !== -1 && nextSpace < firstMatch.start) {
      startIdx = nextSpace + 1;
    }
  }

  // Adjust endIdx to word boundary if not at end
  if (endIdx < plainText.length) {
    const prevSpace = plainText.lastIndexOf(" ", endIdx);
    if (prevSpace > firstMatch.end) {
      endIdx = prevSpace;
    }
  }

  const snippet = plainText.slice(startIdx, endIdx).trim();
  const prefix = startIdx > 0 ? "..." : "";
  const suffix = endIdx < plainText.length ? "..." : "";

  return `${prefix}${snippet}${suffix}`;
}

