"use client";

import {
  AlertCircle,
  CheckCircle2,
  Code2,
  Eye,
  Filter,
  Info,
  Layers,
  Power,
  RefreshCw,
  Search,
  Sliders,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  XCircle,
} from "lucide-react";
import React, { useMemo, useState } from "react";
import toast from "react-hot-toast";

import { useGetSettings, useToggleSetting } from "@/api/setting";
import type { SettingItemType } from "@/api/setting/setting.type";
import { Button } from "@/components/ui";
import { SettingDetailModal } from "./setting-detail-modal";

export const AdminSettingsView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ENABLED" | "DISABLED">(
    "ALL"
  );
  const [groupFilter, setGroupFilter] = useState<string>("ALL");
  const [selectedSetting, setSelectedSetting] = useState<SettingItemType | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Fetch settings from API
  const { data, isLoading, isFetching, refetch } = useGetSettings();
  const settings = data?.data || [];

  // Toggle mutation
  const toggleMutation = useToggleSetting({
    onSuccess: (updated) => {
      toast.success(
        updated.isEnabled
          ? `Đã bật chức năng: ${updated.key}`
          : `Đã ẩn chức năng: ${updated.key}`
      );
      if (selectedSetting?.id === updated.id) {
        setSelectedSetting(updated);
      }
      setTogglingId(null);
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.message ||
        "Có lỗi xảy ra khi cập nhật trạng thái chức năng";
      toast.error(message);
      setTogglingId(null);
    },
  });

  const handleToggle = (id: string, currentStatus?: boolean) => {
    setTogglingId(id);
    toggleMutation.mutate(id);
  };

  const handleOpenDetail = (setting: SettingItemType) => {
    setSelectedSetting(setting);
    setIsModalOpen(true);
  };

  // Distinct groups
  const availableGroups = useMemo(() => {
    const set = new Set<string>();
    settings.forEach((s) => {
      if (s.group) set.add(s.group);
    });
    return Array.from(set).sort();
  }, [settings]);

  // Filtered settings
  const filteredSettings = useMemo(() => {
    return settings.filter((item) => {
      // 1. Status Filter
      if (statusFilter === "ENABLED" && !item.isEnabled) return false;
      if (statusFilter === "DISABLED" && item.isEnabled) return false;

      // 2. Group Filter
      if (groupFilter !== "ALL" && (item.group || "GENERAL") !== groupFilter) {
        return false;
      }

      // 3. Search query
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;

      const matchKey = item.key.toLowerCase().includes(q);
      const matchDesc = item.description?.toLowerCase().includes(q);
      const matchGroup = item.group?.toLowerCase().includes(q);

      return matchKey || matchDesc || matchGroup;
    });
  }, [settings, statusFilter, groupFilter, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = settings.length;
    const enabled = settings.filter((s) => s.isEnabled).length;
    const disabled = settings.filter((s) => !s.isEnabled).length;
    const groupsCount = availableGroups.length || 1;
    return { total, enabled, disabled, groupsCount };
  }, [settings, availableGroups]);

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#EDE5D8]/80 pb-5">
        <div>
          <h1
            className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Quản lý Bật / Tắt Chức năng
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Kiểm soát hiển thị các tính năng trên website. Khi quản trị viên tắt,
            chức năng sẽ được ẩn trên toàn bộ giao diện người dùng.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold border-[#EDE5D8] hover:bg-[#FAF7F0] shadow-2xs"
          >
            <RefreshCw
              className={`h-4 w-4 text-amber-700 ${isFetching ? "animate-spin" : ""}`}
            />
            <span>Làm mới</span>
          </Button>
        </div>
      </div>

      {/* 2. Notice Banner (Instruction about SQL creation) */}
      <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-amber-900 text-xs sm:text-sm leading-relaxed">
        <Info className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-amber-950">
            Cơ chế kích hoạt tính năng (Feature Flags)
          </p>
          <p className="text-amber-800/90 mt-0.5">
            Các chức năng hệ thống được định danh và khởi tạo trực tiếp qua cơ sở dữ
            liệu. Quản trị viên chỉ cần thao tác nút gạt{" "}
            <strong>Bật / Tắt</strong> bên dưới để quyết định việc hiển thị tính năng
            cho người dùng.
          </p>
        </div>
      </div>

      {/* 3. Statistical Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Features */}
        <div className="p-4 rounded-2xl bg-[#FBF9F4] border border-[#EDE5D8] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Tổng chức năng
            </span>
            <div className="h-8 w-8 rounded-xl bg-amber-100/70 text-amber-800 flex items-center justify-center">
              <Sliders className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-neutral-900">
              {isLoading ? "..." : stats.total}
            </span>
            <span className="text-xs text-neutral-500">cấu hình</span>
          </div>
        </div>

        {/* Enabled Features */}
        <div className="p-4 rounded-2xl bg-[#FBF9F4] border border-[#EDE5D8] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
              Đang bật (Hiện)
            </span>
            <div className="h-8 w-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-700">
              {isLoading ? "..." : stats.enabled}
            </span>
            <span className="text-xs text-neutral-500">đang hoạt động</span>
          </div>
        </div>

        {/* Disabled Features */}
        <div className="p-4 rounded-2xl bg-[#FBF9F4] border border-[#EDE5D8] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Đang tắt (Ẩn)
            </span>
            <div className="h-8 w-8 rounded-xl bg-neutral-200/80 text-neutral-700 flex items-center justify-center">
              <XCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-neutral-600">
              {isLoading ? "..." : stats.disabled}
            </span>
            <span className="text-xs text-neutral-500">tạm ẩn</span>
          </div>
        </div>

        {/* Groups */}
        <div className="p-4 rounded-2xl bg-[#FBF9F4] border border-[#EDE5D8] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Nhóm chức năng
            </span>
            <div className="h-8 w-8 rounded-xl bg-amber-100/70 text-amber-800 flex items-center justify-center">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-neutral-900">
              {isLoading ? "..." : stats.groupsCount}
            </span>
            <span className="text-xs text-neutral-500">nhóm phân loại</span>
          </div>
        </div>
      </div>

      {/* 4. Filter and Search Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-[#EDE5D8] shadow-2xs">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Tìm theo mã chức năng (key), mô tả hoặc nhóm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-[#FAF7F0]/60 border border-[#EDE5D8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-600/30 transition-all text-neutral-900 placeholder:text-neutral-400"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setStatusFilter("ALL")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              statusFilter === "ALL"
                ? "bg-[#9C5812] text-white shadow-xs"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            }`}
          >
            Tất cả ({settings.length})
          </button>
          <button
            onClick={() => setStatusFilter("ENABLED")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
              statusFilter === "ENABLED"
                ? "bg-emerald-700 text-white shadow-xs"
                : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Đang bật ({stats.enabled})
          </button>
          <button
            onClick={() => setStatusFilter("DISABLED")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
              statusFilter === "DISABLED"
                ? "bg-neutral-800 text-white shadow-xs"
                : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
            }`}
          >
            <XCircle className="h-3.5 w-3.5" />
            Đang tắt ({stats.disabled})
          </button>

          {/* Group Filter Dropdown */}
          {availableGroups.length > 0 && (
            <select
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#FAF7F0] border border-[#EDE5D8] text-neutral-700 focus:outline-none focus:ring-2 focus:ring-amber-600/30"
            >
              <option value="ALL">Tất cả nhóm</option>
              {availableGroups.map((grp) => (
                <option key={grp} value={grp}>
                  Nhóm: {grp}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* 5. Main Settings Table */}
      <div className="rounded-2xl border border-[#EDE5D8] bg-white overflow-hidden shadow-2xs">
        {isLoading ? (
          <div className="p-12 text-center space-y-3">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-amber-800 border-t-transparent mx-auto" />
            <p className="text-sm font-medium text-neutral-600">
              Đang tải danh sách chức năng hệ thống...
            </p>
          </div>
        ) : filteredSettings.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-800">
              <Sliders className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-neutral-800">
              {searchQuery || statusFilter !== "ALL" || groupFilter !== "ALL"
                ? "Không tìm thấy chức năng phù hợp bộ lọc"
                : "Chưa có chức năng nào trong hệ thống"}
            </h3>
            <p className="text-xs text-neutral-500 max-w-md mx-auto">
              {searchQuery || statusFilter !== "ALL" || groupFilter !== "ALL"
                ? "Thử xóa bộ lọc hoặc đổi từ khóa tìm kiếm."
                : "Hãy thêm cấu hình chức năng đầu tiên vào bảng settings trong cơ sở dữ liệu."}
            </p>
            {(searchQuery || statusFilter !== "ALL" || groupFilter !== "ALL") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("ALL");
                  setGroupFilter("ALL");
                }}
                className="mt-2 text-xs"
              >
                Xóa tất cả bộ lọc
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#EDE5D8] bg-[#FBF9F4] text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">Chức năng / Mã Key</th>
                  <th className="py-3.5 px-4">Nhóm</th>
                  <th className="py-3.5 px-4">Mô tả</th>
                  <th className="py-3.5 px-4 text-center">Trạng thái</th>
                  <th className="py-3.5 px-4 text-center">Bật / Tắt</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDE5D8]/70 text-sm">
                {filteredSettings.map((item) => {
                  const isCurrentToggling =
                    togglingId === item.id ||
                    (toggleMutation.isPending &&
                      toggleMutation.variables === item.id);

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-[#FAF7F0]/50 transition-colors group"
                    >
                      {/* Key & Icon */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-bold transition-colors ${
                              item.isEnabled
                                ? "bg-amber-100 text-amber-900"
                                : "bg-neutral-100 text-neutral-500"
                            }`}
                          >
                            <Sliders className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <span className="font-mono text-xs sm:text-sm font-bold text-neutral-900 block truncate select-all">
                              {item.key}
                            </span>
                            <span className="text-[11px] text-neutral-400 font-mono">
                              ID: {item.id.slice(0, 8)}...
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Group */}
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-neutral-100 text-neutral-700 border border-neutral-200">
                          {item.group || "GENERAL"}
                        </span>
                      </td>

                      {/* Description */}
                      <td className="py-4 px-4 max-w-xs md:max-w-md">
                        <p className="text-xs sm:text-sm text-neutral-700 line-clamp-2 leading-relaxed">
                          {item.description || (
                            <span className="italic text-neutral-400">
                              Không có mô tả
                            </span>
                          )}
                        </p>
                      </td>

                      {/* Status Badge */}
                      <td className="py-4 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                            item.isEnabled
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : "bg-neutral-100 text-neutral-600 border border-neutral-200"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              item.isEnabled
                                ? "bg-emerald-600 animate-pulse"
                                : "bg-neutral-400"
                            }`}
                          />
                          {item.isEnabled ? "Đang hiện" : "Đang ẩn"}
                        </span>
                      </td>

                      {/* Interactive Toggle Switch */}
                      <td className="py-4 px-4 text-center">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={item.isEnabled}
                          disabled={isCurrentToggling}
                          onClick={() => handleToggle(item.id, item.isEnabled)}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                            item.isEnabled ? "bg-emerald-600" : "bg-neutral-300"
                          }`}
                          title={
                            item.isEnabled
                              ? "Bấm để tắt chức năng này"
                              : "Bấm để bật chức năng này"
                          }
                        >
                          <span className="sr-only">Toggle {item.key}</span>
                          <span
                            aria-hidden="true"
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out flex items-center justify-center ${
                              item.isEnabled ? "translate-x-5" : "translate-x-0"
                            }`}
                          >
                            {isCurrentToggling ? (
                              <div className="h-3 w-3 animate-spin rounded-full border-2 border-amber-800 border-t-transparent" />
                            ) : item.isEnabled ? (
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                            ) : (
                              <span className="h-1.5 w-1.5 rounded-full bg-neutral-400" />
                            )}
                          </span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDetail(item)}
                          className="h-8 px-2.5 text-xs text-neutral-600 hover:text-amber-800 hover:bg-amber-50 rounded-xl"
                          title="Xem chi tiết"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          <span>Chi tiết</span>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 6. Detail Modal */}
      <SettingDetailModal
        setting={selectedSetting}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onToggle={(id) => handleToggle(id)}
        isToggling={
          togglingId === selectedSetting?.id ||
          (toggleMutation.isPending &&
            toggleMutation.variables === selectedSetting?.id)
        }
      />
    </div>
  );
};
