"use client";

import { usePathname } from "next/navigation";
import React, { useMemo, useState } from "react";

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

  // Auto detect active sidebar navigation item if not explicitly supplied
  const detectedActiveId = useMemo(() => {
    if (activeId) return activeId;
    if (!pathname || pathname === "/") return "home";
    if (pathname.startsWith("/bach-thoai")) return "bach-thoai";
    if (pathname.startsWith("/yeu-thich")) return "favorites";
    if (pathname.startsWith("/khai-thi")) return "khai-thi";
    if (pathname.startsWith("/niem-kinh")) return "practice";
    if (pathname.startsWith("/tu-tap")) return "practice";
    return "home";
  }, [pathname, activeId]);

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
    <div className={cn("flex min-h-screen w-full bg-[#FAF7F0] text-neutral-800", className)}>
      {/* Sidebar Navigation */}
      <Sidebar
        activeId={detectedActiveId}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Viewport */}
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        {/* Sticky Header with Search and Favorites */}
        <Header
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onSearch={onSearch || ((query) => console.log("Searching for:", query))}
        />

        {/* Dashboard Main Content Area (Outlet slot) */}
        <main className={cn("mx-auto w-full flex-1", maxWidthClass, mainClassName)}>
          {children}
        </main>
      </div>
    </div>
  );
};

export const AppLayout = MainLayout;
