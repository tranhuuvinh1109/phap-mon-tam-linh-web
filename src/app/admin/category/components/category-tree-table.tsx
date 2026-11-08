"use client";

import {
  ChevronDown,
  ChevronRight,
  Copy,
  CornerDownRight,
  FileText,
  Folder,
  FolderOpen,
  FolderPlus,
  Pencil,
  Trash2,
} from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";

import type { CategoryItemType } from "@/api/category/category.type";

interface CategoryTreeTableProps {
  categories: CategoryItemType[];
  searchQuery: string;
  expandedIds: Set<string>;
  onToggleExpand: (id: string) => void;
  onAddChild: (parentCategory: CategoryItemType) => void;
  onEdit: (category: CategoryItemType) => void;
  onDelete: (category: CategoryItemType) => void;
  isLoading?: boolean;
}

export const CategoryTreeTable: React.FC<CategoryTreeTableProps> = ({
  categories,
  searchQuery,
  expandedIds,
  onToggleExpand,
  onAddChild,
  onEdit,
  onDelete,
  isLoading,
}) => {
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const handleCopySlug = (slug: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`/${slug}`);
    setCopiedSlug(slug);
    toast.success(`Đã copy: /${slug}`);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  // Filter categories according to searchQuery
  const filteredCategories = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return categories;

    return categories
      .map((parent) => {
        const parentMatches =
          parent.name.toLowerCase().includes(q) ||
          parent.slug.toLowerCase().includes(q) ||
          (parent.description && parent.description.toLowerCase().includes(q));

        const matchedChildren = (parent.children || []).filter(
          (child) =>
            child.name.toLowerCase().includes(q) ||
            child.slug.toLowerCase().includes(q) ||
            (child.description && child.description.toLowerCase().includes(q))
        );

        if (parentMatches || matchedChildren.length > 0) {
          return {
            ...parent,
            // If parent matches, show all children; otherwise show matching children only
            children: parentMatches ? parent.children : matchedChildren,
          };
        }

        return null;
      })
      .filter(Boolean) as CategoryItemType[];
  }, [categories, searchQuery]);

  // Calculate total posts (parent + children)
  const calculateTotalPosts = (cat: CategoryItemType) => {
    const directPosts = cat._count?.posts || 0;
    const childrenPosts = (cat.children || []).reduce(
      (sum, child) => sum + (child._count?.posts || 0),
      0
    );
    return {
      total: directPosts + childrenPosts,
      direct: directPosts,
      children: childrenPosts,
    };
  };

  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-2xs">
        <div className="p-8 text-center space-y-3">
          <div className="inline-flex h-8 w-8 animate-spin rounded-full border-2 border-amber-600 border-t-transparent" />
          <p className="text-sm font-medium text-neutral-500">
            Đang tải dữ liệu cây danh mục...
          </p>
        </div>
      </div>
    );
  }

  if (filteredCategories.length === 0) {
    return (
      <div className="overflow-hidden rounded-2xl border border-dashed border-neutral-300 bg-white/80 p-12 text-center backdrop-blur-xs">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 border border-amber-200 text-amber-700">
          <Folder className="h-7 w-7" />
        </div>
        <h3 className="mt-4 text-base font-bold text-neutral-800">
          {searchQuery
            ? "Không tìm thấy danh mục phù hợp"
            : "Chưa có danh mục nào"}
        </h3>
        <p className="mt-1 text-xs text-neutral-500 max-w-sm mx-auto">
          {searchQuery
            ? `Không có kết quả nào khớp với từ khóa "${searchQuery}". Vui lòng thử lại với từ khóa khác.`
            : "Hệ thống chưa có danh mục nào. Hãy bấm nút 'Tạo danh mục mới' ở trên để bắt đầu."}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200/90 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-neutral-200/80 bg-neutral-50/80 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              <th className="py-3.5 pl-5 pr-3 w-[40%]">Tên danh mục / Phân cấp</th>
              <th className="py-3.5 px-3 w-[22%]">Đường dẫn tĩnh (Slug)</th>
              <th className="py-3.5 px-3 w-[15%] text-center">Số bài viết</th>
              <th className="py-3.5 px-3 w-[13%]">Mô tả</th>
              <th className="py-3.5 pl-3 pr-5 w-[10%] text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 text-xs text-neutral-700">
            {filteredCategories.map((parent) => {
              const hasChildren = Boolean(
                parent.children && parent.children.length > 0
              );
              // Force expanded when searching, otherwise follow state
              const isExpanded = searchQuery
                ? true
                : expandedIds.has(parent.id);
              const postStats = calculateTotalPosts(parent);
              const isParentUncategorized =
                parent.slug === "khong-co-chu-de" ||
                parent.name.trim().toLowerCase() === "không có chủ đề";

              return (
                <React.Fragment key={parent.id}>
                  {/* --- PARENT ROW --- */}
                  <tr className="group bg-white hover:bg-amber-50/40 transition-colors">
                    {/* Column 1: Tree Node Name */}
                    <td className="py-3.5 pl-4 pr-3 font-medium">
                      <div className="flex items-center gap-2">
                        {/* Toggle button */}
                        {hasChildren ? (
                          <button
                            type="button"
                            onClick={() => onToggleExpand(parent.id)}
                            title={isExpanded ? "Thu gọn" : "Mở rộng danh mục con"}
                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-neutral-400 hover:bg-amber-100/70 hover:text-amber-800 transition"
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </button>
                        ) : (
                          <div className="h-6 w-6 shrink-0" />
                        )}

                        {/* Icon */}
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 border border-amber-200/70 text-amber-700">
                          {isExpanded && hasChildren ? (
                            <FolderOpen className="h-4 w-4" />
                          ) : (
                            <Folder className="h-4 w-4" />
                          )}
                        </div>

                        {/* Name & Badges */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-neutral-900 group-hover:text-amber-900 transition-colors">
                              {parent.name}
                            </span>
                            <span className="inline-flex items-center rounded-md border border-amber-300 bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-900">
                              Danh mục cha
                            </span>
                            {isParentUncategorized && (
                              <span className="inline-flex items-center rounded-md border border-neutral-300 bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-600">
                                Mặc định
                              </span>
                            )}
                            {hasChildren && (
                              <span className="inline-flex items-center rounded-md border border-neutral-200 bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-600">
                                {parent.children?.length} con
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Column 2: Slug */}
                    <td className="py-3.5 px-3 font-mono">
                      <div className="flex items-center gap-1.5 group/slug">
                        <span className="rounded-md bg-neutral-100 px-2 py-1 text-[11px] text-neutral-700 font-semibold truncate max-w-[180px]">
                          /{parent.slug}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleCopySlug(parent.slug, e)}
                          title="Copy đường dẫn"
                          className="rounded p-1 text-neutral-400 hover:bg-neutral-200 hover:text-neutral-700 transition opacity-0 group-hover/slug:opacity-100"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                    </td>

                    {/* Column 3: Post Count */}
                    <td className="py-3.5 px-3 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span
                          title={`Tổng: ${postStats.total} bài viết (${postStats.direct} trực tiếp + ${postStats.children} từ danh mục con)`}
                          className="rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-0.5 text-xs font-semibold text-neutral-800"
                        >
                          {postStats.total} bài
                        </span>
                        {hasChildren && (
                          <span className="text-[10px] text-neutral-400 mt-0.5">
                            ({postStats.direct} cha + {postStats.children} con)
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Column 4: Description */}
                    <td className="py-3.5 px-3 max-w-[180px]">
                      <p
                        className="truncate text-neutral-500 text-xs"
                        title={parent.description || "Chưa có mô tả"}
                      >
                        {parent.description || (
                          <span className="italic text-neutral-300">
                            Không có mô tả
                          </span>
                        )}
                      </p>
                    </td>

                    {/* Column 5: Action Buttons */}
                    <td className="py-3.5 pl-3 pr-5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        {/* Quick Add Child Button */}
                        <button
                          type="button"
                          onClick={() => onAddChild(parent)}
                          title="Thêm danh mục con vào đây"
                          className="inline-flex items-center gap-1 rounded-lg border border-amber-300 bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-900 hover:bg-amber-100 transition shadow-2xs"
                        >
                          <FolderPlus className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Thêm con</span>
                        </button>

                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => onEdit(parent)}
                          title="Chỉnh sửa danh mục"
                          className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-amber-800 transition"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>

                        {/* Delete Button */}
                        {isParentUncategorized ? (
                          <button
                            type="button"
                            disabled
                            title="Không thể xóa danh mục mặc định của hệ thống"
                            className="rounded-lg p-1.5 text-neutral-300 cursor-not-allowed opacity-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onDelete(parent)}
                            title="Xóa danh mục"
                            className="rounded-lg p-1.5 text-neutral-400 hover:bg-red-50 hover:text-red-600 transition"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* --- CHILDREN ROWS --- */}
                  {isExpanded &&
                    (parent.children || []).map((child) => {
                      const childPostCount = child._count?.posts || 0;
                      const isChildUncategorized =
                        child.slug === "khong-co-chu-de" ||
                        child.name.trim().toLowerCase() === "không có chủ đề";

                      return (
                        <tr
                          key={child.id}
                          className="group bg-neutral-50/40 hover:bg-amber-50/40 transition-colors border-l-2 border-l-amber-400/80"
                        >
                          {/* Column 1: Child Node Name (Indented) */}
                          <td className="py-2.5 pl-10 sm:pl-12 pr-3">
                            <div className="flex items-center gap-2">
                              {/* Branch connector icon */}
                              <CornerDownRight className="h-3.5 w-3.5 text-amber-500/80 shrink-0" />

                              {/* Child Icon */}
                              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white border border-neutral-200 text-neutral-500">
                                <FileText className="h-3.5 w-3.5" />
                              </div>

                              {/* Child Name & Badge */}
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-medium text-xs text-neutral-800 group-hover:text-amber-900 transition-colors">
                                  {child.name}
                                </span>
                                <span className="inline-flex items-center rounded-md border border-neutral-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-neutral-500">
                                  Danh mục con
                                </span>
                                {isChildUncategorized && (
                                  <span className="inline-flex items-center rounded-md border border-neutral-300 bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-600">
                                    Mặc định
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Column 2: Child Slug */}
                          <td className="py-2.5 px-3 font-mono">
                            <div className="flex items-center gap-1.5 group/cslug">
                              <span className="rounded-md bg-white border border-neutral-200/80 px-2 py-0.5 text-[11px] text-neutral-600 truncate max-w-[180px]">
                                /{child.slug}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => handleCopySlug(child.slug, e)}
                                title="Copy đường dẫn"
                                className="rounded p-1 text-neutral-400 hover:bg-neutral-200 hover:text-neutral-700 transition opacity-0 group-hover/cslug:opacity-100"
                              >
                                <Copy className="h-3 w-3" />
                              </button>
                            </div>
                          </td>

                          {/* Column 3: Child Post Count */}
                          <td className="py-2.5 px-3 text-center">
                            <span className="rounded-full border border-neutral-200 bg-white px-2 py-0.5 text-[11px] font-medium text-neutral-700">
                              {childPostCount} bài
                            </span>
                          </td>

                          {/* Column 4: Child Description */}
                          <td className="py-2.5 px-3 max-w-[180px]">
                            <p
                              className="truncate text-neutral-400 text-xs"
                              title={child.description || "Chưa có mô tả"}
                            >
                              {child.description || (
                                <span className="italic text-neutral-300">
                                  Không có mô tả
                                </span>
                              )}
                            </p>
                          </td>

                          {/* Column 5: Child Action Buttons */}
                          <td className="py-2.5 pl-3 pr-5 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1">
                              {/* Edit Button */}
                              <button
                                type="button"
                                onClick={() => onEdit(child)}
                                title="Chỉnh sửa danh mục con"
                                className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-200 hover:text-amber-800 transition"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>

                              {/* Delete Button */}
                              {isChildUncategorized ? (
                                <button
                                  type="button"
                                  disabled
                                  title="Không thể xóa danh mục mặc định của hệ thống"
                                  className="rounded-lg p-1.5 text-neutral-300 cursor-not-allowed opacity-50"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => onDelete(child)}
                                  title="Xóa danh mục con"
                                  className="rounded-lg p-1.5 text-neutral-400 hover:bg-red-50 hover:text-red-600 transition"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
