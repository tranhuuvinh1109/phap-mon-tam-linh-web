"use client";

import {
  ChevronsDownUp,
  ChevronsUpDown,
  FileText,
  FolderTree,
  Plus,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";

import { useGetCategoryTree } from "@/api/category";
import type { CategoryItemType } from "@/api/category/category.type";
import { Button } from "@/components/ui";
import { CategoryDeleteModal } from "./category-delete-modal";
import { CategoryModal } from "./category-modal";
import { CategoryTreeTable } from "./category-tree-table";

export const AdminCategoryView: React.FC = () => {
  const {
    data: categories = [],
    isLoading,
    isRefetching,
    refetch,
  } = useGetCategoryTree();

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Expanded parent categories state
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Default expand all when categories are loaded first time
  useEffect(() => {
    if (categories.length > 0) {
      setExpandedIds(new Set(categories.map((c) => c.id)));
    }
  }, [categories]);

  // Modal Create / Edit state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItemType | null>(null);
  const [modalInitialParentId, setModalInitialParentId] = useState<string | null>(null);

  // Modal Delete state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<CategoryItemType | null>(null);

  // Toggle single parent
  const handleToggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Expand all parents
  const handleExpandAll = () => {
    setExpandedIds(new Set(categories.map((c) => c.id)));
  };

  // Collapse all parents
  const handleCollapseAll = () => {
    setExpandedIds(new Set());
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingCategory(null);
    setModalInitialParentId(null);
    setIsModalOpen(true);
  };

  // Open Quick Add Child Modal
  const handleAddChild = (parent: CategoryItemType) => {
    setEditingCategory(null);
    setModalInitialParentId(parent.id);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleEdit = (category: CategoryItemType) => {
    setEditingCategory(category);
    setModalInitialParentId(null);
    setIsModalOpen(true);
  };

  // Open Delete Modal
  const handleDelete = (category: CategoryItemType) => {
    setDeletingCategory(category);
    setIsDeleteModalOpen(true);
  };

  // Compute stats
  const stats = useMemo(() => {
    const rootCount = categories.length;
    let childCount = 0;
    let totalPosts = 0;

    categories.forEach((root) => {
      totalPosts += root._count?.posts || 0;
      if (root.children) {
        childCount += root.children.length;
        root.children.forEach((child) => {
          totalPosts += child._count?.posts || 0;
        });
      }
    });

    return {
      totalCategories: rootCount + childCount,
      rootCount,
      childCount,
      totalPosts,
    };
  }, [categories]);

  return (
    <div className="space-y-6">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100/80 border border-amber-300 text-amber-900 shadow-2xs">
              <FolderTree className="h-5 w-5" />
            </div>
            <div>
              <h1
                className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Quản lý Danh mục
              </h1>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 pl-12.5">
            Tổ chức cây chuyên mục nội dung, bài viết và bài giảng Phật Pháp theo mô hình phân cấp Cha - Con.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isLoading || isRefetching}
            title="Làm mới dữ liệu"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 hover:text-amber-800 transition shadow-2xs"
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefetching ? "animate-spin text-amber-600" : ""}`}
            />
          </button>

          <Button
            type="button"
            onClick={handleOpenCreate}
            className="flex items-center gap-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white px-4 py-2 text-sm font-semibold shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Tạo danh mục mới</span>
          </Button>
        </div>
      </div>

      {/* 2. Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-2xs">
          <p className="text-xs font-medium text-neutral-500">Tổng danh mục</p>
          <p className="mt-1 text-2xl font-bold text-neutral-900">
            {stats.totalCategories}
          </p>
        </div>

        <div className="rounded-2xl border border-amber-200/80 bg-amber-50/40 p-4 shadow-2xs">
          <p className="text-xs font-semibold text-amber-800">Danh mục cha (Gốc)</p>
          <p className="mt-1 text-2xl font-bold text-amber-900">
            {stats.rootCount}
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-2xs">
          <p className="text-xs font-medium text-neutral-500">Danh mục con (Trực thuộc)</p>
          <p className="mt-1 text-2xl font-bold text-neutral-900">
            {stats.childCount}
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-2xs">
          <p className="text-xs font-medium text-neutral-500">Tổng bài viết liên kết</p>
          <p className="mt-1 text-2xl font-bold text-neutral-900">
            {stats.totalPosts}
          </p>
        </div>
      </div>

      {/* 3. Toolbar: Search & Tree Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-neutral-200/90 bg-white p-3.5 shadow-2xs">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute inset-y-0 left-3 my-auto h-4 w-4 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên danh mục, slug, mô tả..."
            className="w-full rounded-xl border border-neutral-200 bg-neutral-50/60 pl-9 pr-8 py-2 text-xs sm:text-sm text-neutral-800 placeholder:text-neutral-400 transition focus:border-amber-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-2.5 my-auto flex h-5 w-5 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-200 hover:text-neutral-700 transition"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Tree Expand / Collapse controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={handleExpandAll}
            title="Mở rộng tất cả các danh mục cha"
            className="flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-900 transition shadow-2xs"
          >
            <ChevronsUpDown className="h-3.5 w-3.5 text-amber-700" />
            <span>Mở rộng tất cả</span>
          </button>

          <button
            type="button"
            onClick={handleCollapseAll}
            title="Thu gọn các danh mục con"
            className="flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition shadow-2xs"
          >
            <ChevronsDownUp className="h-3.5 w-3.5 text-neutral-500" />
            <span>Thu gọn</span>
          </button>
        </div>
      </div>

      {/* 4. Tree Table */}
      <CategoryTreeTable
        categories={categories}
        searchQuery={searchQuery}
        expandedIds={expandedIds}
        onToggleExpand={handleToggleExpand}
        onAddChild={handleAddChild}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
      />

      {/* 5. Modals */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        category={editingCategory}
        initialParentId={modalInitialParentId}
      />

      <CategoryDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        category={deletingCategory}
      />
    </div>
  );
};
