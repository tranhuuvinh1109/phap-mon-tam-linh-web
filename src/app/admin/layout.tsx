"use client";

import {
  ArrowLeft,
  ChevronRight,
  FileText,
  FolderTree,
  LayoutDashboard,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

import toast from "react-hot-toast";

import { LotusLogo } from "@/components/shared/lotus-logo";
import { getAuthToken } from "@/lib/axios";
import { trackRedirect } from "@/lib/gtm";
import { useAuthStore } from "@/stores/auth-store";
import { AdminUserProfile } from "./components/admin-user-profile";
import { AdminSidebarNav } from "./components/admin-sidebar-nav";
import { AdminNotificationBell } from "./components/admin-notification-bell";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  useEffect(() => {
    setIsMounted(true);
    try {
      const saved = localStorage.getItem("admin_sidebar_collapsed");
      if (saved !== null) {
        setIsSidebarCollapsed(saved === "true");
      }
    } catch {
      // ignore
    }
  }, []);

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("admin_sidebar_collapsed", String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Auth Guard: Redirect unauthenticated users to login with pre-url
  useEffect(() => {
    if (!isMounted) return;

    const token = getAuthToken();
    if (!token || (isHydrated && !isAuthenticated)) {
      toast.error("Vui lòng đăng nhập để truy cập trang quản trị", {
        id: "auth-guard-admin",
      });
      const targetPreUrl = pathname || "/admin";
      trackRedirect({
        from: pathname || "/admin",
        to: `/login?pre-url=${encodeURIComponent(targetPreUrl)}`,
        reason: "admin_unauthorized",
      });
      router.replace(`/login?pre-url=${encodeURIComponent(targetPreUrl)}`);
    }
  }, [isMounted, isAuthenticated, isHydrated, pathname, router]);

  // Prevent flash of admin portal before auth verification
  if (!isMounted || (!isAuthenticated && !getAuthToken())) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#FAF7F0]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-3 border-amber-800 border-t-transparent" />
          <p className="text-sm font-medium text-amber-900">
            Đang kiểm tra quyền truy cập...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-[#FAF7F0] text-neutral-800">
      {/* Desktop Admin Sidebar */}
      <aside
        className={`hidden lg:flex shrink-0 flex-col justify-between border-r border-[#EDE5D8] bg-[#FBF9F4] sticky top-0 h-screen select-none transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? "w-[72px] px-2.5 py-4" : "w-64 p-5"
        }`}
      >
        <div className="flex flex-col h-full min-h-0">
          {/* Logo, Title & Collapse/Extend Toggle Button */}
          <div
            className={`flex items-center pb-4 border-b border-[#EDE5D8]/80 shrink-0 ${
              isSidebarCollapsed
                ? "flex-col justify-center gap-2 px-1"
                : "justify-between px-2"
            }`}
          >
            <div
              className={`flex items-center gap-3 overflow-hidden ${
                isSidebarCollapsed ? "justify-center" : ""
              }`}
            >
              <LotusLogo size={isSidebarCollapsed ? 30 : 36} />
              {!isSidebarCollapsed && (
                <div className="min-w-0 transition-opacity duration-200">
                  <h2
                    className="text-base font-bold text-amber-950 leading-tight truncate"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    Phật Pháp
                  </h2>
                  <span className="text-[11px] font-medium text-amber-700 tracking-wider uppercase block truncate">
                    Quản trị hệ thống
                  </span>
                </div>
              )}
            </div>

            {/* Toggle Button (Collapse/Extend) */}
            <button
              type="button"
              onClick={toggleSidebar}
              className="flex items-center justify-center rounded-lg p-1.5 text-neutral-500 hover:bg-[#F2EADB] hover:text-amber-900 transition-colors cursor-pointer"
              title={
                isSidebarCollapsed
                  ? "Mở rộng thanh bên (Extend sidebar)"
                  : "Thu gọn thanh bên (Collapse sidebar)"
              }
              aria-label={
                isSidebarCollapsed
                  ? "Mở rộng thanh bên"
                  : "Thu gọn thanh bên"
              }
            >
              {isSidebarCollapsed ? (
                <PanelLeftOpen className="h-4.5 w-4.5" />
              ) : (
                <PanelLeftClose className="h-4.5 w-4.5" />
              )}
            </button>
          </div>

          {/* Navigation Links with smooth scroll */}
          <div className="flex-1 overflow-y-auto pt-4 pr-0.5 space-y-1">
            <React.Suspense
              fallback={
                <div className="space-y-3 p-2">
                  <div className="h-8 rounded-xl bg-neutral-200/50 animate-pulse" />
                  <div className="h-8 rounded-xl bg-neutral-200/50 animate-pulse" />
                  <div className="h-8 rounded-xl bg-neutral-200/50 animate-pulse" />
                </div>
              }
            >
              <AdminSidebarNav
                isCollapsed={isSidebarCollapsed}
                onItemClick={() => setIsMobileOpen(false)}
              />
            </React.Suspense>
          </div>
        </div>

        {/* Back to Home Link */}
        <div className="pt-3 border-t border-[#EDE5D8]/80 shrink-0">
          <Link
            href="/"
            title={isSidebarCollapsed ? "Trở về Trang chủ" : undefined}
            className={`flex items-center rounded-xl text-xs font-semibold text-neutral-600 hover:text-amber-800 hover:bg-[#F2EADB]/60 transition-all ${
              isSidebarCollapsed
                ? "justify-center p-2.5 relative group"
                : "gap-2.5 px-3 py-2"
            }`}
          >
            <ArrowLeft className="h-4 w-4 shrink-0" />
            {!isSidebarCollapsed && (
              <span className="truncate">Trở về Trang chủ</span>
            )}
            {isSidebarCollapsed && (
              <div className="pointer-events-none absolute left-full ml-3 z-50 hidden group-hover:block whitespace-nowrap rounded-lg bg-neutral-900 px-2.5 py-1 text-xs font-semibold text-white shadow-xl animate-in fade-in-0 duration-150">
                Trở về Trang chủ
              </div>
            )}
          </Link>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 w-72 max-w-[80vw] bg-[#FBF9F4] p-5 shadow-2xl z-10 flex flex-col justify-between">
            <div className="flex flex-col h-full min-h-0">
              <div className="flex items-center justify-between pb-5 border-b border-[#EDE5D8] shrink-0">
                <div className="flex items-center gap-2.5">
                  <LotusLogo size={32} />
                  <span className="font-bold text-amber-950">Quản trị</span>
                </div>
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="rounded-lg p-1 text-neutral-500 hover:bg-neutral-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto pt-5 pr-1">
                <React.Suspense fallback={null}>
                  <AdminSidebarNav isCollapsed={false} onItemClick={() => setIsMobileOpen(false)} />
                </React.Suspense>
              </div>
            </div>

            <div className="pt-4 border-t border-[#EDE5D8] shrink-0">
              <Link
                href="/"
                className="flex items-center gap-2 text-xs font-semibold text-neutral-600"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Trở về Trang chủ</span>
              </Link>
            </div>
          </aside>
        </div>
      )}

      {/* Main Admin Content Viewport */}
      <div className="flex flex-1 flex-col min-w-0 min-h-screen overflow-x-hidden">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[#EDE5D8]/80 bg-[#FAF7F0]/90 px-4 py-3.5 backdrop-blur-md sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="rounded-lg p-2 text-neutral-600 hover:bg-[#F2EADB] lg:hidden cursor-pointer"
              aria-label="Mở menu quản trị"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Breadcrumb Navigation */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-neutral-500 font-medium">
              <Link href="/admin" className="hover:text-amber-800 transition-colors">
                Quản trị
              </Link>
              {pathname.startsWith("/admin/post") && (
                <>
                  <ChevronRight className="h-3.5 w-3.5 text-neutral-400" />
                  <Link href="/admin/post" className="hover:text-amber-800 transition-colors">
                    Bài viết
                  </Link>
                  {pathname === "/admin/post/create-post" && (
                    <>
                      <ChevronRight className="h-3.5 w-3.5 text-neutral-400" />
                      <span className="text-amber-900 font-semibold">Tạo mới</span>
                    </>
                  )}
                  {pathname === "/admin/post/pending" && (
                    <>
                      <ChevronRight className="h-3.5 w-3.5 text-neutral-400" />
                      <span className="text-amber-900 font-semibold">Chờ duyệt</span>
                    </>
                  )}
                </>
              )}
              {pathname.startsWith("/admin/category") && (
                <>
                  <ChevronRight className="h-3.5 w-3.5 text-neutral-400" />
                  <Link href="/admin/category" className="hover:text-amber-800 transition-colors">
                    Danh mục
                  </Link>
                  <ChevronRight className="h-3.5 w-3.5 text-neutral-400" />
                  <span className="text-amber-900 font-semibold">Tạo mới</span>
                </>
              )}
            </div>
          </div>

          {/* Actions & User Profile on Right */}
          <div className="flex items-center gap-3">
            <AdminNotificationBell />
            <AdminUserProfile />
          </div>
        </header>

        {/* Child Page Content */}
        <div className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-5xl w-full mx-auto min-w-0">
          {children}
        </div>
      </div>
    </div>
  );
}
