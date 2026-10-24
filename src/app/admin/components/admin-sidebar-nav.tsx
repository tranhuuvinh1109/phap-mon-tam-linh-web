"use client";

import {
  Bell,
  BookOpen,
  FileText,
  Flame,
  Folder,
  FolderTree,
  LayoutDashboard,
  Settings,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import React, { useMemo } from "react";

import { useGetCategories } from "@/api/category";
import { DEFAULT_CATEGORY_NAMES } from "@/constants";
import { slugify } from "@/lib/utils";

interface AdminSidebarNavProps {
  onItemClick?: () => void;
}

export interface CategoryNavItem {
  id: string;
  name: string;
  slug: string;
  href: string;
  icon: React.ElementType;
}

/**
 * Assign iconic symbol based on category name or slug
 */
const getCategoryIcon = (nameOrSlug: string): React.ElementType => {
  const s = slugify(nameOrSlug).toLowerCase();
  if (s.includes("bach-thoai")) return BookOpen;
  if (s.includes("niem-kinh") || s.includes("kinh")) return Flame;
  if (s.includes("khai-thi")) return Sparkles;
  return Folder;
};

export const AdminSidebarNav: React.FC<AdminSidebarNavProps> = ({
  onItemClick,
}) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category");

  // Call API GET /categories to fetch all existing categories
  const { data: categories = [], isLoading } = useGetCategories();

  /**
   * Merge DEFAULT_CATEGORY_NAMES constant with API categories.
   * "Nếu trùng với constant thì chỉ hiển thị 1 tab"
   */
  const categoryNavItems = useMemo<CategoryNavItem[]>(() => {
    const items: CategoryNavItem[] = [];
    const matchedApiCategoryIds = new Set<string>();

    // 1. Process each default category from constant
    DEFAULT_CATEGORY_NAMES.forEach((defName) => {
      const defSlug = slugify(defName).toLowerCase();

      // Look for a matching category in the API response
      const matched = categories.find((cat) => {
        const catSlug = (cat.slug || slugify(cat.name)).toLowerCase();
        const catNameSlug = slugify(cat.name).toLowerCase();
        return catSlug === defSlug || catNameSlug === defSlug;
      });

      if (matched) {
        matchedApiCategoryIds.add(matched.id);
        const resolvedSlug = matched.slug || defSlug;
        items.push({
          id: matched.id,
          name: matched.name || defName,
          slug: resolvedSlug,
          href: `/admin/post?category=${encodeURIComponent(resolvedSlug)}`,
          icon: getCategoryIcon(resolvedSlug),
        });
      } else {
        items.push({
          id: defSlug,
          name: defName,
          slug: defSlug,
          href: `/admin/post?category=${encodeURIComponent(defSlug)}`,
          icon: getCategoryIcon(defSlug),
        });
      }
    });

    // 2. Append extra categories from API that are NOT in the constant
    categories.forEach((cat) => {
      if (matchedApiCategoryIds.has(cat.id)) return;

      const catSlug = (cat.slug || slugify(cat.name)).toLowerCase();
      const isAlreadyIncluded = DEFAULT_CATEGORY_NAMES.some(
        (defName) => slugify(defName).toLowerCase() === catSlug
      );
      if (isAlreadyIncluded) return;

      items.push({
        id: cat.id,
        name: cat.name,
        slug: cat.slug || slugify(cat.name),
        href: `/admin/post?category=${encodeURIComponent(cat.slug || slugify(cat.name))}`,
        icon: getCategoryIcon(cat.slug || cat.name),
      });
    });

    return items;
  }, [categories]);

  const isDashboardActive = pathname === "/admin";
  const isAllPostsActive = pathname === "/admin/post" && !currentCategory;

  return (
    <nav className="space-y-6">
      {/* 1. Main Dashboard */}
      <div className="space-y-1">
        <Link
          href="/admin"
          onClick={onItemClick}
          className={`group flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
            isDashboardActive
              ? "bg-[#F3E8D8] text-[#9C5812] font-semibold shadow-xs"
              : "text-[#6C6356] hover:bg-[#F8F2E8] hover:text-[#9C5812]"
          }`}
        >
          <LayoutDashboard
            className={`h-4.5 w-4.5 shrink-0 ${
              isDashboardActive
                ? "text-[#9C5812]"
                : "text-[#7D7364] group-hover:text-[#9C5812]"
            }`}
          />
          <span>Tổng quan</span>
        </Link>
      </div>

      {/* 2. Posts by Categories Tabs */}
      <div className="space-y-1">
        <div className="flex items-center justify-between px-3 pb-2 text-[11px] font-bold text-amber-900/70 uppercase tracking-wider">
          <span>Chuyên mục bài viết</span>
          <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-full">
            {categoryNavItems.length}
          </span>
        </div>

        {/* All Posts tab */}
        <Link
          href="/admin/post"
          onClick={onItemClick}
          className={`group flex items-center gap-3.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            isAllPostsActive
              ? "bg-[#F3E8D8] text-[#9C5812] font-semibold shadow-xs"
              : "text-[#6C6356] hover:bg-[#F8F2E8] hover:text-[#9C5812]"
          }`}
        >
          <FileText
            className={`h-4 w-4 shrink-0 ${
              isAllPostsActive
                ? "text-[#9C5812]"
                : "text-[#7D7364] group-hover:text-[#9C5812]"
            }`}
          />
          <span>Tất cả bài viết</span>
        </Link>

        {/* Category Tabs */}
        {categoryNavItems.map((tab) => {
          const Icon = tab.icon;
          const isActive =
            pathname.startsWith("/admin/post") &&
            currentCategory?.toLowerCase() === tab.slug.toLowerCase();

          return (
            <Link
              key={tab.id}
              href={tab.href}
              onClick={onItemClick}
              className={`group flex items-center justify-between px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-[#F3E8D8] text-[#9C5812] font-semibold shadow-xs"
                  : "text-[#6C6356] hover:bg-[#F8F2E8] hover:text-[#9C5812]"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon
                  className={`h-4 w-4 shrink-0 ${
                    isActive
                      ? "text-[#9C5812]"
                      : "text-[#7D7364] group-hover:text-[#9C5812]"
                  }`}
                />
                <span className="truncate">{tab.name}</span>
              </div>
            </Link>
          );
        })}

        {isLoading && categoryNavItems.length === 0 && (
          <div className="space-y-1.5 px-3 py-2">
            <div className="h-6 w-3/4 rounded-lg bg-neutral-200/60 animate-pulse" />
            <div className="h-6 w-2/3 rounded-lg bg-neutral-200/60 animate-pulse" />
          </div>
        )}
      </div>

      {/* 3. System Management */}
      <div className="space-y-1">
        <div className="px-3 pb-2 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
          Hệ thống
        </div>

        <Link
          href="/admin/category"
          onClick={onItemClick}
          className={`group flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
            pathname.startsWith("/admin/category")
              ? "bg-[#F3E8D8] text-[#9C5812] font-semibold shadow-xs"
              : "text-[#6C6356] hover:bg-[#F8F2E8] hover:text-[#9C5812]"
          }`}
        >
          <FolderTree
            className={`h-4.5 w-4.5 shrink-0 ${
              pathname.startsWith("/admin/category")
                ? "text-[#9C5812]"
                : "text-[#7D7364] group-hover:text-[#9C5812]"
            }`}
          />
          <span>Quản lý danh mục</span>
        </Link>

        <Link
          href="/admin/users"
          onClick={onItemClick}
          className={`group flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
            pathname.startsWith("/admin/users")
              ? "bg-[#F3E8D8] text-[#9C5812] font-semibold shadow-xs"
              : "text-[#6C6356] hover:bg-[#F8F2E8] hover:text-[#9C5812]"
          }`}
        >
          <Users
            className={`h-4.5 w-4.5 shrink-0 ${
              pathname.startsWith("/admin/users")
                ? "text-[#9C5812]"
                : "text-[#7D7364] group-hover:text-[#9C5812]"
            }`}
          />
          <span>Người dùng</span>
        </Link>

        <Link
          href="/admin/notifications"
          onClick={onItemClick}
          className={`group flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
            pathname.startsWith("/admin/notifications")
              ? "bg-[#F3E8D8] text-[#9C5812] font-semibold shadow-xs"
              : "text-[#6C6356] hover:bg-[#F8F2E8] hover:text-[#9C5812]"
          }`}
        >
          <Bell
            className={`h-4.5 w-4.5 shrink-0 ${
              pathname.startsWith("/admin/notifications")
                ? "text-[#9C5812]"
                : "text-[#7D7364] group-hover:text-[#9C5812]"
            }`}
          />
          <span>Thông báo Push</span>
        </Link>

        <Link
          href="/admin/settings"
          onClick={onItemClick}
          className={`group flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
            pathname.startsWith("/admin/settings")
              ? "bg-[#F3E8D8] text-[#9C5812] font-semibold shadow-xs"
              : "text-[#6C6356] hover:bg-[#F8F2E8] hover:text-[#9C5812]"
          }`}
        >
          <Settings
            className={`h-4.5 w-4.5 shrink-0 ${
              pathname.startsWith("/admin/settings")
                ? "text-[#9C5812]"
                : "text-[#7D7364] group-hover:text-[#9C5812]"
            }`}
          />
          <span>Cài đặt</span>
        </Link>
      </div>
    </nav>
  );
};
