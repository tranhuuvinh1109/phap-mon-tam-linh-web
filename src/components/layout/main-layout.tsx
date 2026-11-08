"use client";

import { usePathname } from "next/navigation";
import React, { useEffect, useMemo, useRef, useState } from "react";

import { Header } from "./header";
import { Sidebar } from "./sidebar";
import { cn } from "@/lib/utils";

export interface MainLayoutProps {
  children?: React.ReactNode;
  activeId?: string;
  userName?: string;
  onSearch?: (query: string) => void;
  maxWidth?: "default" | "4xl" | "full";
  className?: string;
  mainClassName?: string;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  activeId,
  userName,
  onSearch,
  maxWidth = "default",
  className = "",
  mainClassName = "",
}) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const pathname = usePathname();
  const mainRef = useRef<HTMLElement>(null);

  // Auto detect active sidebar navigation item if not explicitly supplied
  const detectedActiveId = useMemo(() => {
    if (activeId) return activeId;
    if (!pathname || pathname === "/") return "home";
    if (pathname.startsWith("/bach-thoai")) return "bach-thoai";
    if (pathname.startsWith("/kinh-sach")) return "kinh-sach";
    if (pathname.startsWith("/yeu-thich")) return "favorites";
    if (pathname.startsWith("/khai-thi")) return "khai-thi";
    if (pathname.startsWith("/niem-kinh")) return "practice";
    if (pathname.startsWith("/tu-tap")) return "practice";
    return "home";
  }, [pathname, activeId]);

  // Scroll main content to top on pathname change
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  // Intercept window.scrollTo so pagination, filters, and other actions scroll the main container
  useEffect(() => {
    const originalScrollTo = window.scrollTo.bind(window);
    const handleScrollTo = (options?: ScrollToOptions | number, y?: number) => {
      if (typeof options === "object") {
        mainRef.current?.scrollTo(options);
        try {
          originalScrollTo(options as ScrollToOptions);
        } catch {
          // ignore
        }
      } else if (typeof options === "number") {
        mainRef.current?.scrollTo(options, y ?? 0);
        originalScrollTo(options, y ?? 0);
      }
    };
    window.scrollTo = handleScrollTo as typeof window.scrollTo;
    return () => {
      window.scrollTo = originalScrollTo;
    };
  }, []);

  const maxWidthClass = useMemo(() => {
    switch (maxWidth) {
      case "4xl":
        return "max-w-4xl px-4 py-5 sm:px-6 sm:py-7";
      case "full":
        return "w-full p-4 sm:p-6 lg:p-7";
      case "default":
      default:
        return "max-w-[1600px] p-4 sm:p-6 lg:p-7";
    }
  }, [maxWidth]);

  return (
    <div
      className={cn(
        "flex h-screen h-dvh w-full overflow-hidden bg-[#FAF7F0] text-neutral-800",
        className
      )}
    >
      {/* Sidebar Navigation */}
      <Sidebar
        activeId={detectedActiveId}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Viewport */}
      <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
        {/* Sticky Header with Search and Favorites */}
        <Header
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onSearch={onSearch || ((query) => console.log("Searching for:", query))}
        />

        {/* Dashboard Main Content Area (Outlet slot) */}
        <main
          ref={mainRef}
          id="main-content"
          className="flex-1 min-h-0 w-full overflow-y-auto overflow-x-hidden"
        >
          <div className={cn("mx-auto w-full", maxWidthClass, mainClassName)}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export const AppLayout = MainLayout;
