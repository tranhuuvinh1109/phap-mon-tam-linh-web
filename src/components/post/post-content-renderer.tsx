"use client";

import React, { useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { parseNiemKinhContent } from "@/app/admin/post/types";
import { isKhaiThi } from "@/app/admin/post/utils/content-type";
import { KHAI_THI_ID, KHAI_THI_SLUG } from "@/constants";
import type { PostCategoryType, PostItemType } from "@/api/post/post.type";
import { highlightInHtml } from "@/lib/highlight";
import { NiemKinhAccordion } from "./niem-kinh-accordion";

interface PostContentRendererProps {
  content?: unknown;
  className?: string;
  category?: PostCategoryType | string | null;
  post?: PostItemType | null;
  isKhaiThi?: boolean;
  searchQuery?: string;
}

export const PostContentRenderer: React.FC<PostContentRendererProps> = ({
  content,
  className = "",
  category,
  post,
  isKhaiThi: isKhaiThiProp,
  searchQuery,
}) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeSearchQuery =
    searchQuery ?? (searchParams?.get("search") || searchParams?.get("q") || "");

  // Determine whether this post belongs to category "khai-thi"
  const isKhaiThiPost = useMemo(() => {
    // 1. Explicit boolean prop takes highest precedence
    if (typeof isKhaiThiProp === "boolean") return isKhaiThiProp;

    // 2. Check post object
    if (post) {
      if (
        isKhaiThi(post.categoryId || post.category?.id, post.category?.slug, post.category?.name)
      ) {
        return true;
      }
      if (post.slug && (post.slug === KHAI_THI_SLUG || post.slug.includes("khai-thi"))) {
        return true;
      }
    }

    // 3. Check category prop (object, slug string, id string, or name string)
    if (category) {
      if (typeof category === "string") {
        const lower = category.toLowerCase();
        if (
          lower === KHAI_THI_SLUG ||
          lower.includes("khai-thi") ||
          lower.includes("khai thị") ||
          category === KHAI_THI_ID
        ) {
          return true;
        }
      } else if (typeof category === "object") {
        if (isKhaiThi(category.id, category.slug, category.name)) return true;
      }
    }

    // 4. Check pathname (/khai-thi or /khai-thi/...)
    if (
      pathname &&
      (pathname.startsWith("/khai-thi") ||
        pathname.includes("/khai-thi") ||
        pathname.includes("khai-thi"))
    ) {
      return true;
    }

    // 5. Check searchParams (?category=khai-thi or ?category=...)
    try {
      const catParam = searchParams?.get("category")?.toLowerCase();
      if (
        catParam &&
        (catParam === KHAI_THI_SLUG || catParam.includes("khai-thi") || catParam === KHAI_THI_ID)
      ) {
        return true;
      }
    } catch {
      // Ignore during SSR
    }

    return false;
  }, [category, isKhaiThiProp, pathname, post, searchParams]);

  // Check if content is Niem Kinh steps data
  const niemKinhData = useMemo(() => {
    return parseNiemKinhContent(content);
  }, [content]);

  const htmlString = useMemo(() => {
    if (niemKinhData) return "";
    if (content === null || content === undefined) {
      return "";
    }

    if (typeof content === "string") {
      const trimmed = content.trim();

      // Check if it's a JSON-encoded Quill Delta string: '{"ops":[...]}'
      if (trimmed.startsWith("{") && trimmed.includes('"ops"')) {
        try {
          const deltaObj = JSON.parse(trimmed) as { ops?: Array<{ insert?: unknown }> };
          if (Array.isArray(deltaObj.ops)) {
            return deltaObj.ops
              .map((op) => {
                if (typeof op.insert === "string") {
                  return `<p>${op.insert.replace(/\n/g, "<br/>")}</p>`;
                }
                if (
                  op.insert &&
                  typeof op.insert === "object" &&
                  "image" in op.insert &&
                  typeof (op.insert as any).image === "string"
                ) {
                  return `<div class="my-4"><img src="${(op.insert as any).image}" class="max-w-full rounded-2xl shadow-xs" alt="Hình ảnh bài viết" loading="lazy" /></div>`;
                }
                return "";
              })
              .join("");
          }
        } catch {
          // If not valid JSON, treat as raw HTML string
        }
      }

      // If it's plain text without HTML tags (like lines with \n), format into paragraphs
      if (!/<[a-z][\s\S]*>/i.test(trimmed)) {
        return trimmed
          .split("\n")
          .map((line) => `<p>${line || "<br/>"}</p>`)
          .join("");
      }

      return content;
    }

    if (typeof content === "object") {
      // If it's a Quill Delta object: { ops: [{ insert: "text" }, ...] }
      const deltaObj = content as { ops?: Array<{ insert?: unknown }> };
      if (Array.isArray(deltaObj.ops)) {
        return deltaObj.ops
          .map((op) => {
            if (typeof op.insert === "string") {
              return `<p>${op.insert.replace(/\n/g, "<br/>")}</p>`;
            }
            if (
              op.insert &&
              typeof op.insert === "object" &&
              "image" in op.insert &&
              typeof (op.insert as any).image === "string"
            ) {
              return `<div class="my-4"><img src="${(op.insert as any).image}" class="max-w-full rounded-2xl shadow-xs" alt="Hình ảnh bài viết" loading="lazy" /></div>`;
            }
            return "";
          })
          .join("");
      }

      try {
        return JSON.stringify(content);
      } catch {
        return "";
      }
    }

    return String(content);
  }, [content, niemKinhData]);

  // Clean non-breaking spaces, inject br spacers for Khai Thi, and apply search highlight
  const cleanHtml = useMemo(() => {
    if (!htmlString) return "";
    let cleaned = htmlString
      .replace(/&nbsp;/g, " ")
      .replace(/\u00a0/g, " ")
      .replace(/&ZeroWidthSpace;/g, "")
      .replace(/\u200B/g, "");

    if (isKhaiThiPost) {
      // For Khai Thi posts, inject an 10px block spacer after each <br> that is followed by more content
      cleaned = cleaned.replace(
        /<br\s*\/?>\s*(?!<\/p>|<span class="rich-post-br-spacer")/gi,
        '<br class="rich-br" /><span class="rich-post-br-spacer" style="display:block;height:10px;line-height:0;font-size:0;" aria-hidden="true"></span>'
      );
    }

    if (activeSearchQuery?.trim()) {
      cleaned = highlightInHtml(cleaned, activeSearchQuery.trim());
    }

    return cleaned;
  }, [htmlString, isKhaiThiPost, activeSearchQuery]);

  if (niemKinhData) {
    return <NiemKinhAccordion data={niemKinhData} className={className} />;
  }

  if (!cleanHtml || !cleanHtml.trim()) {
    return (
      <p className="text-sm text-neutral-400 italic">Bài viết này chưa có nội dung văn bản.</p>
    );
  }

  return (
    <>
      <div
        className={`rich-post-content ${isKhaiThiPost ? "rich-post-content-khai-thi" : ""} w-full max-w-full ${className}`}
        dangerouslySetInnerHTML={{ __html: cleanHtml }}
      />
      {isKhaiThiPost && (
        <style jsx global>{`
          .rich-post-content-khai-thi .rich-post-br-spacer {
            display: block;
            height: 10px;
            line-height: 0;
            font-size: 0;
          }
        `}</style>
      )}
    </>
  );
};
