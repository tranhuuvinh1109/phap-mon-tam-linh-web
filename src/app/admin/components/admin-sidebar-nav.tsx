"use client";

import {
  BookOpen,
  BookText,
  Clock,
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
import { useGetPendingPostsCount } from "@/api/post";
import { DEFAULT_CATEGORY_NAMES } from "@/constants";
import { slugify } from "@/lib/utils";

interface AdminSidebarNavProps {
  onItemClick?: () => void;
  isCollapsed?: boolean;
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
  if (s.includes("kinh-sach") || s.includes("sach")) return BookText;
  if (s.includes("niem-kinh") || s.includes("kinh")) return Flame;
  if (s.includes("khai-thi")) return Sparkles;
  return Folder;
};

export const AdminSidebarNav: React.FC<AdminSidebarNavProps> = ({
  onItemClick,
  isCollapsed = false,
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
  const isPendingPostsActive = pathname === "/admin/post/pending";
  const isAllPostsActive = pathname === "/admin/post" && !currentCategory;

  const { data: pendingData } = useGetPendingPostsCount();
  const pendingCount = pendingData?.count || 0;

  return (
    <nav className={isCollapsed ? "space-y-3" : "space-y-6"}>
      {/* 1. Main Dashboard */}
      <div className="space-y-1">
        <Link
          href="/admin"
          onClick={onItemClick}
          title={isCollapsed ? "Tổng quan" : undefined}
          className={`group relative flex items-center rounded-xl text-sm font-medium transition-all ${
            isCollapsed
              ? "justify-center p-2.5"
              : "gap-3.5 px-4 py-2.5"
          } ${
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
          {!isCollapsed && <span>Tổng quan</span>}
          {isCollapsed && (
            <div className="pointer-events-none absolute left-full ml-3 z-50 hidden group-hover:block whitespace-nowrap rounded-lg bg-neutral-900 px-2.5 py-1 text-xs font-semibold text-white shadow-xl animate-in fade-in-0 duration-150">
              Tổng quan
            </div>
          )}
        </Link>
      </div>

      {/* 2. Posts by Categories Tabs */}
      <div className="space-y-1">
        {!isCollapsed ? (
          <div className="flex items-center justify-between px-3 pb-2 text-[11px] font-bold text-amber-900/70 uppercase tracking-wider">
            <span>Chuyên mục bài viết</span>
            <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-full">
              {categoryNavItems.length}
            </span>
          </div>
        ) : (
          <div className="my-2 border-t border-[#EDE5D8]/80 mx-1" />
        )}

        {/* All Posts tab */}
        <Link
          href="/admin/post"
          onClick={onItemClick}
          title={isCollapsed ? "Tất cả bài viết" : undefined}
          className={`group relative flex items-center rounded-xl text-sm font-medium transition-all ${
            isCollapsed
              ? "justify-center p-2.5"
              : "gap-3.5 px-4 py-2"
          } ${
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
          {!isCollapsed && <span>Tất cả bài viết</span>}
          {isCollapsed && (
            <div className="pointer-events-none absolute left-full ml-3 z-50 hidden group-hover:block whitespace-nowrap rounded-lg bg-neutral-900 px-2.5 py-1 text-xs font-semibold text-white shadow-xl animate-in fade-in-0 duration-150">
              Tất cả bài viết
            </div>
          )}
        </Link>

        {/* Pending Posts tab */}
        <Link
          href="/admin/post/pending"
          onClick={onItemClick}
          title={isCollapsed ? `Bài viết chờ duyệt (${pendingCount})` : undefined}
          className={`group relative flex items-center rounded-xl text-sm font-medium transition-all ${
            isCollapsed
              ? "justify-center p-2.5"
              : "justify-between px-4 py-2"
          } ${
            isPendingPostsActive
              ? "bg-[#F3E8D8] text-[#9C5812] font-semibold shadow-xs"
              : "text-[#6C6356] hover:bg-[#F8F2E8] hover:text-[#9C5812]"
          }`}
        >
          {!isCollapsed ? (
            <>
              <div className="flex items-center gap-3.5 min-w-0">
                <Clock
                  className={`h-4 w-4 shrink-0 ${
                    isPendingPostsActive
                      ? "text-[#9C5812]"
                      : "text-[#7D7364] group-hover:text-[#9C5812]"
                  }`}
                />
                <span className="truncate">Bài viết chờ duyệt</span>
              </div>
              {pendingCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1.5 text-[10px] font-bold text-white shadow-xs">
                  {pendingCount > 99 ? "99+" : pendingCount}
                </span>
              )}
            </>
          ) : (
            <>
              <Clock
                className={`h-4.5 w-4.5 shrink-0 ${
                  isPendingPostsActive
                    ? "text-[#9C5812]"
                    : "text-[#7D7364] group-hover:text-[#9C5812]"
                }`}
              />
              {pendingCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[9px] font-bold text-white shadow-xs ring-2 ring-[#FBF9F4]">
                  {pendingCount > 99 ? "99+" : pendingCount}
                </span>
              )}
              <div className="pointer-events-none absolute left-full ml-3 z-50 hidden group-hover:block whitespace-nowrap rounded-lg bg-neutral-900 px-2.5 py-1 text-xs font-semibold text-white shadow-xl animate-in fade-in-0 duration-150">
                Bài viết chờ duyệt
                {pendingCount > 0 && (
                  <span className="ml-1 text-rose-300 font-bold">({pendingCount})</span>
                )}
              </div>
            </>
          )}
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
              title={isCollapsed ? tab.name : undefined}
              className={`group relative flex items-center rounded-xl text-sm font-medium transition-all ${
                isCollapsed
                  ? "justify-center p-2.5"
                  : "justify-between px-4 py-2"
              } ${
                isActive
                  ? "bg-[#F3E8D8] text-[#9C5812] font-semibold shadow-xs"
                  : "text-[#6C6356] hover:bg-[#F8F2E8] hover:text-[#9C5812]"
              }`}
            >
              {!isCollapsed ? (
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
              ) : (
                <>
                  <Icon
                    className={`h-4.5 w-4.5 shrink-0 ${
                      isActive
                        ? "text-[#9C5812]"
                        : "text-[#7D7364] group-hover:text-[#9C5812]"
                    }`}
                  />
                  <div className="pointer-events-none absolute left-full ml-3 z-50 hidden group-hover:block whitespace-nowrap rounded-lg bg-neutral-900 px-2.5 py-1 text-xs font-semibold text-white shadow-xl animate-in fade-in-0 duration-150">
                    {tab.name}
                  </div>
                </>
              )}
            </Link>
          );
        })}

        {isLoading && categoryNavItems.length === 0 && !isCollapsed && (
          <div className="space-y-1.5 px-3 py-2">
            <div className="h-6 w-3/4 rounded-lg bg-neutral-200/60 animate-pulse" />
            <div className="h-6 w-2/3 rounded-lg bg-neutral-200/60 animate-pulse" />
          </div>
        )}
      </div>

      {/* 3. System Management */}
      <div className="space-y-1">
        {!isCollapsed ? (
          <div className="px-3 pb-2 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
            Hệ thống
          </div>
        ) : (
          <div className="my-2 border-t border-[#EDE5D8]/80 mx-1" />
        )}

        {/* Quản lý danh mục */}
        <Link
          href="/admin/category"
          onClick={onItemClick}
          title={isCollapsed ? "Quản lý danh mục" : undefined}
          className={`group relative flex items-center rounded-xl text-sm font-medium transition-all ${
            isCollapsed
              ? "justify-center p-2.5"
              : "gap-3.5 px-4 py-2.5"
          } ${
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
          {!isCollapsed && <span>Quản lý danh mục</span>}
          {isCollapsed && (
            <div className="pointer-events-none absolute left-full ml-3 z-50 hidden group-hover:block whitespace-nowrap rounded-lg bg-neutral-900 px-2.5 py-1 text-xs font-semibold text-white shadow-xl animate-in fade-in-0 duration-150">
              Quản lý danh mục
            </div>
          )}
        </Link>

        {/* Người dùng */}
        <Link
          href="/admin/users"
          onClick={onItemClick}
          title={isCollapsed ? "Người dùng" : undefined}
          className={`group relative flex items-center rounded-xl text-sm font-medium transition-all ${
            isCollapsed
              ? "justify-center p-2.5"
              : "gap-3.5 px-4 py-2.5"
          } ${
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
          {!isCollapsed && <span>Người dùng</span>}
          {isCollapsed && (
            <div className="pointer-events-none absolute left-full ml-3 z-50 hidden group-hover:block whitespace-nowrap rounded-lg bg-neutral-900 px-2.5 py-1 text-xs font-semibold text-white shadow-xl animate-in fade-in-0 duration-150">
              Người dùng
            </div>
          )}
        </Link>

        {/* Cài đặt */}
        <Link
          href="/admin/settings"
          onClick={onItemClick}
          title={isCollapsed ? "Cài đặt" : undefined}
          className={`group relative flex items-center rounded-xl text-sm font-medium transition-all ${
            isCollapsed
              ? "justify-center p-2.5"
              : "gap-3.5 px-4 py-2.5"
          } ${
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
          {!isCollapsed && <span>Cài đặt</span>}
          {isCollapsed && (
            <div className="pointer-events-none absolute left-full ml-3 z-50 hidden group-hover:block whitespace-nowrap rounded-lg bg-neutral-900 px-2.5 py-1 text-xs font-semibold text-white shadow-xl animate-in fade-in-0 duration-150">
              Cài đặt
            </div>
          )}
        </Link>
      </div>
    </nav>
  );
};
