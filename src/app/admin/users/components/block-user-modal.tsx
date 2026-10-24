"use client";

import { Ban } from "lucide-react";
import React from "react";

import type { UserItemType } from "@/api/user/user.type";
import { ConfirmModal } from "@/app/admin/post/components/confirm-modal";
import { ApprovalStatusEnum } from "@/enums";

interface BlockUserModalProps {
  user: UserItemType | null;
  isOpen: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const BlockUserModal: React.FC<BlockUserModalProps> = ({
  user,
  isOpen,
  isLoading = false,
  onConfirm,
  onClose,
}) => {
  if (!user) return null;

  const isApproved =
    (user.approvalStatus || ApprovalStatusEnum.APPROVED) ===
    ApprovalStatusEnum.APPROVED;

  const title = isApproved
    ? "Xác nhận chặn người dùng"
    : "Xác nhận từ chối tài khoản";

  const description = isApproved
    ? `Bạn có chắc chắn muốn chặn tài khoản "${user.name || user.email}" (${user.email})? Sau khi bị chặn, người dùng này sẽ không thể đăng nhập vào hệ thống.`
    : `Bạn có chắc chắn muốn từ chối yêu cầu đăng ký của tài khoản "${user.name || user.email}" (${user.email})? Người dùng này sẽ không thể đăng nhập.`;

  const confirmText = isApproved ? "Chặn tài khoản" : "Từ chối duyệt";

  return (
    <ConfirmModal
      isOpen={isOpen}
      title={title}
      description={description}
      confirmText={confirmText}
      cancelText="Huỷ bỏ"
      variant="danger"
      icon={<Ban className="h-6 w-6 text-red-600" />}
      isLoading={isLoading}
      onConfirm={onConfirm}
      onClose={onClose}
    />
  );
};
