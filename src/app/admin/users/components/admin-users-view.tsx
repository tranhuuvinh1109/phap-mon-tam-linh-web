"use client";

import {
  Ban,
  Check,
  CheckCircle2,
  Clock,
  Crown,
  Key,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  User,
  UserCheck,
  UserCog,
  UserPlus,
  Users,
  X,
  XCircle,
} from "lucide-react";
import React, { useMemo, useState } from "react";
import toast from "react-hot-toast";

import { useGetUsers, useUpdateApprovalStatus } from "@/api/user";
import type { UserItemType } from "@/api/user/user.type";
import { Button } from "@/components/ui";
import { ApprovalStatusEnum, RoleEnum } from "@/enums";
import { BlockUserModal } from "./block-user-modal";
import { CreateUserModal } from "./create-user-modal";
import { RolePermissionModal } from "./role-permission-modal";

export const AdminUsersView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | RoleEnum>("ALL");
  const [approvalFilter, setApprovalFilter] = useState<"ALL" | ApprovalStatusEnum>("ALL");
  const [selectedUser, setSelectedUser] = useState<UserItemType | null>(null);
  const [userToBlock, setUserToBlock] = useState<UserItemType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [actionLoadingUserId, setActionLoadingUserId] = useState<string | null>(null);

  const { data: users = [], isLoading, isFetching, refetch } = useGetUsers();

  const { mutate: changeApprovalStatus, isPending: isUpdatingApproval } = useUpdateApprovalStatus({
    onSuccess: (updatedUser, variables) => {
      const isApproved = variables.status === ApprovalStatusEnum.APPROVED;
      toast.success(
        isApproved
          ? `Đã phê duyệt tài khoản ${updatedUser.email} thành công!`
          : `Đã cập nhật trạng thái từ chối/chặn tài khoản ${updatedUser.email}!`
      );
      setActionLoadingUserId(null);
      setUserToBlock(null);
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Không thể cập nhật trạng thái phê duyệt";
      toast.error(Array.isArray(msg) ? msg[0] : msg);
      setActionLoadingUserId(null);
      setUserToBlock(null);
    },
  });

  const handleUpdateApproval = (userId: string, status: ApprovalStatusEnum) => {
    setActionLoadingUserId(userId);
    changeApprovalStatus({ userId, status });
  };

  const handleConfirmBlockUser = () => {
    if (!userToBlock) return;
    handleUpdateApproval(userToBlock.id, ApprovalStatusEnum.REJECTED);
  };

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchRole =
        roleFilter === "ALL" ? true : u.role === roleFilter;

      const userStatus = u.approvalStatus || ApprovalStatusEnum.APPROVED;
      const matchApproval =
        approvalFilter === "ALL" ? true : userStatus === approvalFilter;

      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        u.id.toLowerCase().includes(q);

      return matchRole && matchApproval && matchSearch;
    });
  }, [users, roleFilter, approvalFilter, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = users.length;
    const pending = users.filter(
      (u) => (u.approvalStatus || ApprovalStatusEnum.APPROVED) === ApprovalStatusEnum.PENDING
    ).length;
    const rejected = users.filter(
      (u) => (u.approvalStatus || ApprovalStatusEnum.APPROVED) === ApprovalStatusEnum.REJECTED
    ).length;
    const approved = users.filter(
      (u) => (u.approvalStatus || ApprovalStatusEnum.APPROVED) === ApprovalStatusEnum.APPROVED
    ).length;
    const admins = users.filter((u) => u.role === RoleEnum.ADMIN).length;
    const collaborators = users.filter(
      (u) => u.role === RoleEnum.COLLABORATOR
    ).length;
    const regularUsers = users.filter((u) => u.role === RoleEnum.USER).length;

    return { total, pending, rejected, approved, admins, collaborators, regularUsers };
  }, [users]);

  const handleOpenModal = (user: UserItemType) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#EDE5D8]/80 pb-5">
        <div>
          <h1
            className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Quản lý Người dùng & Phân quyền
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Quản lý vai trò (Admin, Cộng tác viên, Người dùng) và kiểm soát quyền hạn
            truy cập, biên tập bài viết Phật Pháp.
          </p>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3">
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold shadow-xs transition cursor-pointer"
          >
            <UserPlus className="h-4 w-4" />
            <span>Tạo tài khoản</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-2 rounded-xl px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold border-[#EDE5D8] hover:bg-[#FAF7F0] shadow-2xs"
          >
            <RefreshCw
              className={`h-4 w-4 text-amber-700 ${isFetching ? "animate-spin" : ""}`}
            />
            <span>Làm mới</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Total Users */}
        <div className="rounded-2xl border border-[#EDE5D8] bg-white p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-neutral-500">Tổng tài khoản</p>
            <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 mt-1">
              {stats.total}
            </h3>
            <span className="text-[11px] text-neutral-400 mt-0.5 block">
              Thành viên hệ thống
            </span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
            <Users className="h-5 w-5" />
          </div>
        </div>

        {/* Pending Approval */}
        <div
          className={`rounded-2xl border p-4 shadow-2xs flex items-center justify-between transition-all ${
            stats.pending > 0
              ? "border-amber-300 bg-amber-50/70 ring-2 ring-amber-400/20"
              : "border-amber-100 bg-amber-50/30"
          }`}
        >
          <div>
            <p className="text-xs font-semibold text-amber-800">Chờ phê duyệt</p>
            <div className="flex items-center gap-2 mt-1">
              <h3 className="text-xl sm:text-2xl font-bold text-amber-950">
                {stats.pending}
              </h3>
              {stats.pending > 0 && (
                <span className="inline-flex items-center rounded-full bg-amber-200/80 px-2 py-0.5 text-[10px] font-bold text-amber-900 animate-pulse">
                  Mới
                </span>
              )}
            </div>
            <span className="text-[11px] text-amber-700/80 mt-0.5 block">
              Cần admin duyệt
            </span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        {/* Admins */}
        <div className="rounded-2xl border border-rose-100 bg-rose-50/40 p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-rose-700">Quản trị viên (ADMIN)</p>
            <h3 className="text-xl sm:text-2xl font-bold text-rose-950 mt-1">
              {stats.admins}
            </h3>
            <span className="text-[11px] text-rose-600/80 mt-0.5 block">
              Full quyền hạn
            </span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
            <Crown className="h-5 w-5" />
          </div>
        </div>

        {/* Collaborators */}
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-emerald-700">
              Cộng tác viên (COLLAB)
            </p>
            <h3 className="text-xl sm:text-2xl font-bold text-emerald-950 mt-1">
              {stats.collaborators}
            </h3>
            <span className="text-[11px] text-emerald-600/80 mt-0.5 block">
              Phân quyền tùy biến
            </span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
            <Shield className="h-5 w-5" />
          </div>
        </div>

        {/* Regular Users */}
        <div className="rounded-2xl border border-neutral-200 bg-neutral-50/50 p-4 shadow-2xs flex items-center justify-between col-span-2 sm:col-span-1">
          <div>
            <p className="text-xs font-medium text-neutral-600">Người dùng (USER)</p>
            <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 mt-1">
              {stats.regularUsers}
            </h3>
            <span className="text-[11px] text-neutral-400 mt-0.5 block">
              Chỉ đọc nội dung
            </span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-200 text-neutral-700">
            <User className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-[#EDE5D8] bg-white p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên, email, hoặc UUID..."
              className="w-full rounded-xl border border-neutral-200 bg-[#FAF7F0]/40 pl-10 pr-4 py-2 text-sm text-neutral-800 placeholder-neutral-400 focus:border-amber-600 focus:bg-white focus:outline-none transition"
            />
          </div>

          {/* Role Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs font-medium text-neutral-400 whitespace-nowrap mr-1">
              Vai trò:
            </span>
            {(
              [
                { id: "ALL", label: "Tất cả" },
                { id: RoleEnum.ADMIN, label: "Admin" },
                { id: RoleEnum.COLLABORATOR, label: "Cộng tác viên" },
                { id: RoleEnum.USER, label: "Người dùng" },
              ] as const
            ).map((tab) => {
              const isActive = roleFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setRoleFilter(tab.id as any)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-amber-700 text-white shadow-2xs"
                      : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Approval Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto border-t border-[#EDE5D8]/60 pt-3">
          <span className="text-xs font-medium text-neutral-400 whitespace-nowrap mr-1">
            Phê duyệt:
          </span>
          {(
            [
              { id: "ALL", label: "Tất cả trạng thái" },
              {
                id: ApprovalStatusEnum.PENDING,
                label: "Chờ phê duyệt",
                badge: stats.pending,
              },
              { id: ApprovalStatusEnum.APPROVED, label: "Đã phê duyệt" },
              { id: ApprovalStatusEnum.REJECTED, label: "Đã từ chối" },
            ] as const
          ).map((tab) => {
            const isActive = approvalFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setApprovalFilter(tab.id as any)}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-neutral-800 text-white shadow-2xs"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                }`}
              >
                <span>{tab.label}</span>
                {typeof (tab as any).badge === "number" && (tab as any).badge > 0 && (
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                      isActive
                        ? "bg-amber-400 text-amber-950"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {(tab as any).badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl border border-[#EDE5D8] bg-white shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-3 border-amber-600 border-t-transparent" />
            <p className="mt-3 text-sm font-medium text-neutral-500">
              Đang tải danh sách người dùng...
            </p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-16 px-4 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FAF7F0] text-amber-800 mb-3">
              <UserCog className="h-7 w-7" />
            </div>
            <h3
              className="text-lg font-bold text-neutral-800"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Không tìm thấy người dùng
            </h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1">
              {searchQuery
                ? `Không có kết quả nào phù hợp với từ khóa "${searchQuery}". Hãy thử tìm kiếm khác.`
                : "Chưa có tài khoản nào trong hệ thống."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#EDE5D8] bg-[#FAF7F0] text-[12px] font-semibold uppercase tracking-wider text-neutral-600">
                  <th className="px-5 py-3.5">Người dùng</th>
                  <th className="px-4 py-3.5">Vai trò</th>
                  <th className="px-4 py-3.5">Phê duyệt</th>
                  <th className="px-4 py-3.5">Quyền hạn (Permissions)</th>
                  <th className="px-4 py-3.5">Ngày tạo</th>
                  <th className="px-5 py-3.5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDE5D8]/70 text-sm">
                {filteredUsers.map((user) => {
                  const role = user.role as RoleEnum;
                  const isAdmin = role === RoleEnum.ADMIN;
                  const isCollaborator = role === RoleEnum.COLLABORATOR;

                  const status =
                    user.approvalStatus || ApprovalStatusEnum.APPROVED;
                  const isPendingStatus = status === ApprovalStatusEnum.PENDING;
                  const isApprovedStatus = status === ApprovalStatusEnum.APPROVED;
                  const isRejectedStatus = status === ApprovalStatusEnum.REJECTED;
                  const isActionLoading = actionLoadingUserId === user.id;

                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-[#FAF7F0]/50 transition-colors"
                    >
                      {/* User Info */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-amber-700 font-bold text-white text-sm shadow-xs">
                            {(user.name || user.email || "U")
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-neutral-900 truncate">
                              {user.name || "Chưa cập nhật tên"}
                            </p>
                            <p className="text-xs text-neutral-500 truncate">
                              {user.email}
                            </p>
                            <p className="text-[11px] font-mono text-neutral-400 truncate mt-0.5">
                              ID: {user.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                            isAdmin
                              ? "bg-rose-100 text-rose-800 border border-rose-200"
                              : isCollaborator
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : "bg-neutral-100 text-neutral-700 border border-neutral-200"
                          }`}
                        >
                          {isAdmin && <Crown className="h-3.5 w-3.5" />}
                          {isCollaborator && <Shield className="h-3.5 w-3.5" />}
                          {!isAdmin && !isCollaborator && (
                            <User className="h-3.5 w-3.5" />
                          )}
                          {user.role}
                        </span>
                      </td>

                      {/* Approval Status Badge */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        {isPendingStatus && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 border border-amber-300 px-3 py-1 text-xs font-semibold text-amber-900">
                            <Clock className="h-3.5 w-3.5 text-amber-700 animate-spin" />
                            <span>Chờ duyệt</span>
                          </span>
                        )}
                        {isApprovedStatus && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 border border-emerald-300 px-3 py-1 text-xs font-semibold text-emerald-900">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
                            <span>Đã duyệt</span>
                          </span>
                        )}
                        {isRejectedStatus && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 border border-rose-300 px-3 py-1 text-xs font-semibold text-rose-900">
                            <XCircle className="h-3.5 w-3.5 text-rose-700" />
                            <span>Đã từ chối</span>
                          </span>
                        )}
                      </td>

                      {/* Permissions List */}
                      <td className="px-4 py-4">
                        {isAdmin ? (
                          <div className="flex items-center gap-1.5 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200/80 rounded-lg px-2.5 py-1 w-fit">
                            <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                            <span>Toàn quyền hệ thống</span>
                          </div>
                        ) : isCollaborator ? (
                          user.permissions && user.permissions.length > 0 ? (
                            <div className="flex flex-wrap items-center gap-1.5 max-w-md">
                              {user.permissions.map((p) => (
                                <span
                                  key={p.id}
                                  title={p.description}
                                  className="inline-flex items-center gap-1 rounded-md bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 text-[11px] font-mono font-bold text-emerald-800"
                                >
                                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                                  {p.name}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs italic text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              Chưa cấp quyền nào
                            </span>
                          )
                        ) : (
                          <span className="text-xs text-neutral-400">
                            Không có quyền đặc biệt
                          </span>
                        )}
                      </td>

                      {/* Created At */}
                      <td className="px-4 py-4 text-xs text-neutral-500 whitespace-nowrap">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString("vi-VN")
                          : "Không rõ"}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Approval Quick Action Buttons */}
                          {isPendingStatus && (
                            <>
                              <button
                                type="button"
                                title="Phê duyệt tài khoản"
                                disabled={isActionLoading}
                                onClick={() =>
                                  handleUpdateApproval(
                                    user.id,
                                    ApprovalStatusEnum.APPROVED
                                  )
                                }
                                className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-emerald-700 transition disabled:opacity-50"
                              >
                                <Check className="h-3.5 w-3.5" />
                                <span>Duyệt</span>
                              </button>

                              <button
                                type="button"
                                title="Từ chối tài khoản"
                                disabled={isActionLoading}
                                onClick={() => setUserToBlock(user)}
                                className="inline-flex items-center gap-1 rounded-xl bg-rose-600 px-2.5 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-rose-700 transition disabled:opacity-50"
                              >
                                <X className="h-3.5 w-3.5" />
                                <span>Từ chối</span>
                              </button>
                            </>
                          )}

                          {isRejectedStatus && (
                            <button
                              type="button"
                              title="Phê duyệt lại"
                              disabled={isActionLoading}
                              onClick={() =>
                                handleUpdateApproval(
                                  user.id,
                                  ApprovalStatusEnum.APPROVED
                                )
                              }
                              className="inline-flex items-center gap-1 rounded-xl border border-emerald-300 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition disabled:opacity-50"
                            >
                              <Check className="h-3.5 w-3.5" />
                              <span>Duyệt lại</span>
                            </button>
                          )}

                          {isApprovedStatus && !isAdmin && (
                            <button
                              type="button"
                              title="Chặn / Từ chối tài khoản"
                              disabled={isActionLoading}
                              onClick={() => setUserToBlock(user)}
                              className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50/60 px-2 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition disabled:opacity-50"
                            >
                              <Ban className="h-3.5 w-3.5" />
                              <span>Chặn</span>
                            </button>
                          )}

                          {/* Permissions Modal Trigger */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenModal(user)}
                            className="inline-flex items-center gap-1.5 rounded-xl border-[#EDE5D8] hover:border-amber-600 hover:bg-[#FAF7F0] text-amber-900 font-semibold text-xs shadow-2xs"
                          >
                            <Key className="h-3.5 w-3.5 text-amber-700" />
                            <span>Phân quyền</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => refetch()}
      />

      {/* Role and Permissions Edit Modal */}
      <RolePermissionModal
        user={selectedUser}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

      {/* Block / Reject User Confirmation Modal */}
      <BlockUserModal
        user={userToBlock}
        isOpen={!!userToBlock}
        isLoading={isUpdatingApproval && actionLoadingUserId === userToBlock?.id}
        onConfirm={handleConfirmBlockUser}
        onClose={() => {
          if (!isUpdatingApproval) {
            setUserToBlock(null);
          }
        }}
      />
    </div>
  );
};
