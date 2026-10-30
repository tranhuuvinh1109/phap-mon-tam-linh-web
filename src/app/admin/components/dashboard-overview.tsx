"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  ChevronRight,
  Eye,
  FileText,
  Headphones,
  Plus,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useMemo, useState } from "react";

// Types for Dashboard Fake Data
export type TimePeriod = "week" | "month";

interface StatCardData {
  id: string;
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  subtitle: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
}

interface TopViewedPostItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  views: number;
  audioPlays?: number;
  author: string;
  thumbnailUrl: string;
  publishedAt: string;
}

interface TrafficDataPoint {
  label: string;
  shortLabel: string;
  visitors: number;
  views: number;
  heightPercent: number;
}

// 1. Mock Statistics Data
const STATS_DATA: StatCardData[] = [
  {
    id: "posts",
    title: "Tổng số bài viết",
    value: "148",
    change: "+12 bài",
    isPositive: true,
    subtitle: "so với tháng trước",
    icon: FileText,
    iconColor: "text-amber-700",
    iconBg: "bg-amber-100",
  },
  {
    id: "views",
    title: "Tổng lượt xem",
    value: "284.5K",
    change: "+18.4%",
    isPositive: true,
    subtitle: "so với kỳ trước",
    icon: Eye,
    iconColor: "text-blue-700",
    iconBg: "bg-blue-100",
  },
  {
    id: "audio",
    title: "Lượt nghe Pháp âm",
    value: "96.2K",
    change: "+24.1%",
    isPositive: true,
    subtitle: "tăng trưởng mạnh",
    icon: Headphones,
    iconColor: "text-emerald-700",
    iconBg: "bg-emerald-100",
  },
  {
    id: "visitors",
    title: "Người truy cập",
    value: "64.8K",
    change: "+15.6%",
    isPositive: true,
    subtitle: "trong tháng này",
    icon: Users,
    iconColor: "text-purple-700",
    iconBg: "bg-purple-100",
  },
];

// 2. Mock Top Viewed Posts
const TOP_VIEWED_POSTS: TopViewedPostItem[] = [
  {
    id: "p-1",
    title: "Buông bỏ muộn phiền để tìm lại sự an lạc và tự tại trong tâm hồn",
    slug: "buong-bo-muon-phien-an-lac",
    category: "Khai thị",
    views: 42850,
    audioPlays: 12400,
    author: "TT. Thích Minh Niệm",
    thumbnailUrl: "/images/lotus-thumb.jpg",
    publishedAt: "08/10/2026",
  },
  {
    id: "p-2",
    title: "Ý nghĩa của lòng từ bi, hạnh nhẫn nhục và phương pháp nuôi dưỡng tâm bồ đề",
    slug: "y-nghia-long-tu-bi-hanh-nhan-nhuc",
    category: "Bạch thoại Phật pháp",
    views: 38200,
    audioPlays: 15800,
    author: "TT. Thích Pháp Hòa",
    thumbnailUrl: "/images/buddha-thumb.jpg",
    publishedAt: "05/10/2026",
  },
  {
    id: "p-3",
    title: "Kinh Kim Cang: Bát Nhã Ba La Mật Đa và ánh sáng trí tuệ giải thoát",
    slug: "kinh-kim-cang-tri-tue-giai-thoat",
    category: "Kinh",
    views: 29400,
    audioPlays: 8900,
    author: "TT. Thích Chân Quang",
    thumbnailUrl: "/images/home-hero-banner.jpg",
    publishedAt: "01/10/2026",
  },
  {
    id: "p-4",
    title: "Chánh niệm trong từng bước chân và hơi thở giữa nhịp sống bận rộn",
    slug: "chanh-niem-tung-buoc-chan",
    category: "Khai thị",
    views: 24150,
    audioPlays: 6200,
    author: "Thiền sư Thích Nhất Hạnh",
    thumbnailUrl: "/images/auth-banner.jpg",
    publishedAt: "28/09/2026",
  },
  {
    id: "p-5",
    title: "Nhân quả ba đời và bài học thức tỉnh lương tri của người con Phật",
    slug: "nhan-qua-ba-doi-bai-hoc-thuc-tinh",
    category: "Bạch thoại Phật pháp",
    views: 19800,
    audioPlays: 7450,
    author: "TT. Thích Minh Niệm",
    thumbnailUrl: "/images/lotus-thumb.jpg",
    publishedAt: "24/09/2026",
  },
];

// 3. Mock Traffic Data for Week & Month
const WEEK_TRAFFIC: TrafficDataPoint[] = [
  { label: "Thứ 2", shortLabel: "T2", visitors: 2150, views: 6800, heightPercent: 55 },
  { label: "Thứ 3", shortLabel: "T3", visitors: 2840, views: 8900, heightPercent: 70 },
  { label: "Thứ 4", shortLabel: "T4", visitors: 3200, views: 10400, heightPercent: 82 },
  { label: "Thứ 5", shortLabel: "T5", visitors: 2950, views: 9200, heightPercent: 74 },
  { label: "Thứ 6", shortLabel: "T6", visitors: 3820, views: 12100, heightPercent: 92 },
  { label: "Thứ 7", shortLabel: "T7", visitors: 4500, views: 14800, heightPercent: 100 },
  { label: "Chủ nhật", shortLabel: "CN", visitors: 4120, views: 13500, heightPercent: 95 },
];

const MONTH_TRAFFIC: TrafficDataPoint[] = [
  { label: "Tuần 1", shortLabel: "T1", visitors: 14200, views: 58000, heightPercent: 72 },
  { label: "Tuần 2", shortLabel: "T2", visitors: 15850, views: 64200, heightPercent: 80 },
  { label: "Tuần 3", shortLabel: "T3", visitors: 16900, views: 72100, heightPercent: 88 },
  { label: "Tuần 4", shortLabel: "T4", visitors: 17870, views: 80220, heightPercent: 100 },
];

export const DashboardOverview: React.FC = () => {
  const [period, setPeriod] = useState<TimePeriod>("week");

  const trafficData = useMemo(() => {
    return period === "week" ? WEEK_TRAFFIC : MONTH_TRAFFIC;
  }, [period]);

  const currentVisitorsCount = useMemo(() => {
    return period === "week" ? "23,580" : "64,820";
  }, [period]);

  const currentViewsCount = useMemo(() => {
    return period === "week" ? "75,700" : "274,520";
  }, [period]);

  return (
    <div className="space-y-6 sm:space-y-8 min-w-0">
      {/* 1. Header Banner */}
      <div className="flex flex-col gap-4 border-b border-[#EDE5D8]/80 pb-5 sm:flex-row sm:items-center sm:justify-between min-w-0">
        <div className="min-w-0 flex-1">
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-amber-300/80 bg-amber-100/70 px-2.5 py-0.5 text-xs font-semibold text-amber-900">
            <Sparkles className="h-3.5 w-3.5 text-amber-700" />
            <span>Trung tâm điều khiển</span>
          </div>
          <h1
            className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl break-words"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Tổng quan Hệ thống
          </h1>
          <p className="mt-1 text-xs text-neutral-500 sm:text-sm break-words">
            Theo dõi lưu lượng truy cập, tương tác bài viết và chỉ số phát triển Phật Pháp.
          </p>
        </div>

        {/* Quick Action Button */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 w-full sm:w-auto shrink-0">
          <Link
            href="/admin/users"
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#EDE5D8] bg-white px-3.5 py-2.5 text-xs font-semibold text-neutral-800 shadow-2xs transition-colors hover:bg-[#FAF7F0] hover:text-amber-900 sm:text-sm"
          >
            <ShieldCheck className="h-4 w-4 text-amber-700 shrink-0" />
            <span className="break-words">Phân quyền thành viên</span>
          </Link>
          <Link
            href="/admin/post/create-post"
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-amber-800 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-amber-900 sm:text-sm"
          >
            <Plus className="h-4 w-4 shrink-0" />
            <span className="break-words">Tạo bài viết mới</span>
          </Link>
        </div>
      </div>

      {/* 2. Key Metric Stat Cards - 2 cols on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
        {STATS_DATA.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.id}
              className="rounded-2xl border border-[#EDE5D8]/90 bg-white/95 p-3.5 shadow-2xs backdrop-blur-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs sm:p-5 flex flex-col justify-between"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-medium text-neutral-500 break-words leading-tight">
                  {stat.title}
                </span>
                <div
                  className={`flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl ${stat.iconBg} ${stat.iconColor}`}
                >
                  <Icon className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                </div>
              </div>

              <div className="mt-2.5">
                <div className="flex flex-wrap items-baseline gap-1.5 sm:gap-2">
                  <span className="text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl">
                    {stat.value}
                  </span>
                  <span
                    className={`inline-flex items-center text-[10px] font-semibold sm:text-xs ${
                      stat.isPositive ? "text-emerald-700" : "text-rose-700"
                    }`}
                  >
                    {stat.isPositive ? (
                      <ArrowUpRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    )}
                    {stat.change}
                  </span>
                </div>
                <p className="mt-1 text-[10px] text-neutral-400 break-words leading-tight sm:text-[11px]">
                  {stat.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Traffic Overview Chart with Week / Month Toggle */}
      <div className="rounded-2xl border border-[#EDE5D8]/90 bg-white/95 p-4 shadow-2xs sm:p-6 overflow-hidden">
        {/* Card Header */}
        <div className="flex flex-col gap-3 sm:gap-4 border-b border-neutral-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-amber-700 shrink-0" />
              <h3 className="text-base font-bold text-neutral-900 sm:text-lg break-words">
                Lưu lượng Người truy cập & Lượt xem
              </h3>
            </div>
            <p className="mt-0.5 text-xs text-neutral-500 break-words">
              Thống kê lượng Phật tử viếng thăm và nghe đọc trong{" "}
              {period === "week" ? "tuần này" : "tháng này"}
            </p>
          </div>

          {/* Period Toggle Controls */}
          <div className="inline-flex items-center rounded-xl border border-[#EDE5D8] bg-[#FAF7F0] p-1 text-xs self-start sm:self-auto shrink-0">
            <button
              type="button"
              onClick={() => setPeriod("week")}
              className={`cursor-pointer rounded-lg px-3 py-1.5 font-semibold transition ${
                period === "week"
                  ? "bg-amber-800 text-white shadow-2xs"
                  : "text-neutral-600 hover:text-amber-900"
              }`}
            >
              Trong tuần
            </button>
            <button
              type="button"
              onClick={() => setPeriod("month")}
              className={`cursor-pointer rounded-lg px-3 py-1.5 font-semibold transition ${
                period === "month"
                  ? "bg-amber-800 text-white shadow-2xs"
                  : "text-neutral-600 hover:text-amber-900"
              }`}
            >
              Trong tháng
            </button>
          </div>
        </div>

        {/* Aggregate Highlights */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 border-b border-neutral-100/80 pt-4 pb-5 sm:grid-cols-3">
          <div className="min-w-0">
            <p className="text-[10px] sm:text-[11px] font-medium tracking-wider text-neutral-500 uppercase break-words">
              {period === "week" ? "Tổng người truy cập tuần" : "Tổng người truy cập tháng"}
            </p>
            <p className="mt-1 text-lg font-bold text-neutral-900 sm:text-2xl">
              {currentVisitorsCount}
            </p>
            <span className="mt-0.5 flex items-center gap-0.5 text-[10px] sm:text-[11px] font-medium text-emerald-700">
              <TrendingUp className="h-3 w-3 shrink-0" />
              <span>+14.8% so với kỳ trước</span>
            </span>
          </div>

          <div className="min-w-0">
            <p className="text-[10px] sm:text-[11px] font-medium tracking-wider text-neutral-500 uppercase break-words">
              {period === "week" ? "Tổng lượt xem tuần" : "Tổng lượt xem tháng"}
            </p>
            <p className="mt-1 text-lg font-bold text-neutral-900 sm:text-2xl">
              {currentViewsCount}
            </p>
            <span className="mt-0.5 flex items-center gap-0.5 text-[10px] sm:text-[11px] font-medium text-emerald-700">
              <TrendingUp className="h-3 w-3 shrink-0" />
              <span>+22.3% thời gian đọc</span>
            </span>
          </div>

          <div className="col-span-2 sm:col-span-1 min-w-0 pt-1 sm:pt-0">
            <p className="text-[10px] sm:text-[11px] font-medium tracking-wider text-neutral-500 uppercase break-words">
              Thời gian lưu lại trung bình
            </p>
            <p className="mt-1 text-lg font-bold text-neutral-900 sm:text-2xl">8 phút 42 giây</p>
            <span className="mt-0.5 block text-[10px] sm:text-[11px] font-medium text-neutral-500 break-words">
              Tập trung ở mục Pháp thoại Audio
            </span>
          </div>
        </div>

        {/* Visual Bar Chart Presentation */}
        <div className="pt-6 relative overflow-x-clip">
          <div className="flex h-48 w-full items-end justify-between gap-1.5 px-1 sm:h-56 sm:gap-4 sm:px-2">
            {trafficData.map((pt, idx) => (
              <div
                key={idx}
                className="group relative flex h-full flex-1 flex-col items-center justify-end gap-1.5 sm:gap-2"
              >
                {/* Tooltip on Hover / Tap - constrained position so it never overflows viewport */}
                <div
                  className={`pointer-events-none mb-1 rounded-lg bg-neutral-900 px-2 py-1 text-[10px] font-medium whitespace-nowrap text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100 sm:text-[11px] z-20 absolute bottom-full ${
                    idx === 0
                      ? "left-0"
                      : idx === trafficData.length - 1
                      ? "right-0"
                      : "left-1/2 -translate-x-1/2"
                  }`}
                >
                  <div>{pt.visitors.toLocaleString()} người</div>
                  <div className="font-bold text-amber-300">
                    {pt.views.toLocaleString()} lượt xem
                  </div>
                </div>

                {/* Vertical Bar */}
                <div className="flex h-full w-full max-w-[42px] flex-col justify-end overflow-hidden rounded-t-xl bg-amber-100/70">
                  <div
                    style={{ height: `${pt.heightPercent}%` }}
                    className="w-full rounded-t-xl bg-gradient-to-t from-amber-800 to-amber-600 transition-all duration-500 group-hover:brightness-110"
                  />
                </div>

                {/* Day / Week Label: full label on sm+, clean responsive abbreviation on mobile */}
                <span className="mt-1 text-[10px] font-semibold text-neutral-600 group-hover:text-amber-900 sm:text-xs text-center leading-tight">
                  <span className="sm:hidden">{pt.shortLabel}</span>
                  <span className="hidden sm:inline">{pt.label}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Top Most Viewed Posts Section */}
      <div className="rounded-2xl border border-[#EDE5D8]/90 bg-white/95 p-4 shadow-2xs sm:p-6 overflow-hidden">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
          <div className="min-w-0 pr-2">
            <h3 className="text-base font-bold text-neutral-900 sm:text-lg break-words">
              Bài viết được xem nhiều nhất
            </h3>
            <p className="mt-0.5 text-xs text-neutral-500 break-words">
              Xếp hạng theo tổng lượt xem và số lượt phát âm thanh trực tuyến
            </p>
          </div>

          <Link
            href="/admin/post"
            className="flex items-center gap-1 text-xs font-semibold text-amber-800 transition hover:text-amber-900 shrink-0"
          >
            <span>Quản lý tất cả</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Posts Table / Responsive List with Full Text Wrapping */}
        <div className="divide-y divide-neutral-100">
          {TOP_VIEWED_POSTS.map((post, index) => (
            <div
              key={post.id}
              className="group flex flex-col justify-between gap-3 rounded-xl p-2.5 sm:p-3 transition hover:bg-[#FAF7F0]/80 sm:flex-row sm:items-center"
            >
              {/* Left: Rank, Image & Details (items-start for clean multi-line wrapping) */}
              <div className="flex min-w-0 flex-1 items-start gap-3 sm:gap-3.5">
                {/* Rank Number Badge */}
                <span
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold sm:h-7 sm:w-7 ${
                    index === 0
                      ? "bg-amber-600 text-white shadow-2xs"
                      : index === 1
                        ? "bg-amber-500/80 text-white"
                        : index === 2
                          ? "bg-amber-400/80 text-neutral-900"
                          : "bg-neutral-100 text-neutral-500"
                  }`}
                >
                  {index + 1}
                </span>

                {/* Thumbnail */}
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-[#EDE5D8] bg-amber-50 sm:h-14 sm:w-14">
                  <Image
                    src={post.thumbnailUrl}
                    alt={post.title}
                    fill
                    className="object-cover transition group-hover:scale-105"
                  />
                </div>

                {/* Info Text with Full Text Display and Clean Multi-line Wrap */}
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md border border-amber-200 bg-amber-100/80 px-2 py-0.5 text-[10px] font-semibold text-amber-900">
                      {post.category}
                    </span>
                    <span className="text-[11px] font-medium text-neutral-400">
                      {post.publishedAt}
                    </span>
                  </div>

                  {/* Full title displayed, allowed to wrap without breaking layout */}
                  <h4 className="text-xs sm:text-sm font-bold text-neutral-900 leading-snug break-words transition group-hover:text-amber-800">
                    {post.title}
                  </h4>

                  {/* Author information */}
                  <p className="text-[11px] text-neutral-500 break-words">
                    Tác giả: <span className="font-medium text-neutral-700">{post.author}</span>
                  </p>

                  {/* Mobile Metrics (Rendered neatly under the author to prevent detached self-end lines) */}
                  <div className="flex flex-wrap items-center gap-3.5 pt-1 sm:hidden">
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-neutral-700">
                      <Eye className="h-3 w-3 text-neutral-400" />
                      <span>{post.views.toLocaleString()}</span>
                      <span className="text-[10px] text-neutral-400 font-normal">lượt xem</span>
                    </div>

                    {post.audioPlays ? (
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-800">
                        <Headphones className="h-3 w-3 text-emerald-600" />
                        <span>{post.audioPlays.toLocaleString()}</span>
                        <span className="text-[10px] text-neutral-400 font-normal">lượt nghe</span>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Desktop Metrics Stats (Hidden on mobile, cleanly aligned on desktop) */}
              <div className="hidden sm:flex shrink-0 items-center gap-6 sm:self-center">
                {/* Views Count */}
                <div className="text-right">
                  <div className="flex items-center justify-end gap-1 text-xs font-bold text-neutral-900 sm:text-sm">
                    <Eye className="h-3.5 w-3.5 text-neutral-400" />
                    <span>{post.views.toLocaleString()}</span>
                  </div>
                  <span className="text-[10px] text-neutral-400">lượt xem</span>
                </div>

                {/* Audio Plays Count */}
                {post.audioPlays ? (
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-1 text-xs font-bold text-emerald-800 sm:text-sm">
                      <Headphones className="h-3.5 w-3.5 text-emerald-600" />
                      <span>{post.audioPlays.toLocaleString()}</span>
                    </div>
                    <span className="text-[10px] text-neutral-400">lượt nghe</span>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
