"use client";

import {
  AlertCircle,
  Eye,
  EyeOff,
  Info,
  Lock,
  Mail,
  User,
  UserPlus,
  X,
} from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";

import { useCreateUser } from "@/api/user";
import { Button } from "@/components/ui";
import { ApprovalStatusEnum, RoleEnum } from "@/enums";

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreateUserModal: React.FC<CreateUserModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});

  const { mutate: createUserMutate, isPending } = useCreateUser({
    onSuccess: (newUser) => {
      toast.success(
        `Đã tạo tài khoản thành công cho ${newUser.name ? `"${newUser.name}"` : ""} (${newUser.email})!`
      );
      handleReset();
      onSuccess?.();
      onClose();
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Đã có lỗi xảy ra khi tạo tài khoản người dùng.";
      const errorText = Array.isArray(msg) ? msg.join(", ") : msg;

      if (
        errorText.toLowerCase().includes("email") &&
        errorText.toLowerCase().includes("already exists")
      ) {
        setErrors((prev) => ({
          ...prev,
          email: `Địa chỉ email "${email}" đã được đăng ký trên hệ thống.`,
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          general: errorText,
        }));
      }
      toast.error(errorText);
    },
  });

  const handleReset = () => {
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    setErrors({});
  };

  const handleClose = () => {
    if (isPending) return;
    handleReset();
    onClose();
  };

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!email.trim()) {
      newErrors.email = "Vui lòng nhập địa chỉ email.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = "Định dạng email không hợp lệ.";
    }

    if (!password) {
      newErrors.password = "Vui lòng nhập mật khẩu.";
    } else if (password.length < 6) {
      newErrors.password = "Mật khẩu phải có tối thiểu 6 ký tự.";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Vui lòng nhập lại mật khẩu xác nhận.";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không trùng khớp.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Luôn tạo tài khoản user thông thường, trạng thái PENDING để admin phê duyệt sau
    createUserMutate({
      email: email.trim().toLowerCase(),
      password,
      name: name.trim() || undefined,
      role: RoleEnum.USER,
      approvalStatus: ApprovalStatusEnum.PENDING,
    });
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-lg max-h-[92vh] flex flex-col rounded-3xl border border-[#EDE5D8] bg-[#FFFDF9] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="relative border-b border-[#EDE5D8] bg-gradient-to-r from-[#FAF5EB] via-[#FDFBF7] to-[#FAF5EB] px-5 sm:px-6 py-4.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-800 text-white shadow-xs">
                <UserPlus className="h-5 w-5" />
              </div>
              <div>
                <h3
                  className="text-lg sm:text-xl font-bold text-neutral-900"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  Tạo tài khoản người dùng
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Thêm tài khoản thành viên mới vào hệ thống
                </p>
              </div>
            </div>

            <button
              onClick={handleClose}
              disabled={isPending}
              className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-200/60 hover:text-neutral-700 transition cursor-pointer disabled:opacity-50"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 sm:space-y-4.5">
          {errors.general && (
            <div className="flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50/80 p-3.5 text-xs text-rose-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errors.general}</span>
            </div>
          )}

          {/* 1. Name */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-neutral-800 mb-1.5">
              Họ và tên / Pháp danh <span className="text-neutral-400 font-normal">(Tùy chọn)</span>
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                }}
                placeholder="Ví dụ: Phật tử Thiện Tâm..."
                className="w-full rounded-xl border border-neutral-200 bg-white py-2.5 pl-10 pr-3.5 text-xs sm:text-sm text-neutral-900 placeholder-neutral-400 shadow-2xs outline-none transition focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
          </div>

          {/* 2. Email */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-neutral-800 mb-1.5">
              Địa chỉ Email <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                placeholder="email@example.com"
                className={`w-full rounded-xl border bg-white py-2.5 pl-10 pr-3.5 text-xs sm:text-sm text-neutral-900 placeholder-neutral-400 shadow-2xs outline-none transition focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 ${
                  errors.email ? "border-rose-300 ring-2 ring-rose-200/50" : "border-neutral-200"
                }`}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                <span>{errors.email}</span>
              </p>
            )}
          </div>

          {/* 3. Password & Confirm Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-neutral-800 mb-1.5">
                Mật khẩu <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  placeholder="Tối thiểu 6 ký tự"
                  className={`w-full rounded-xl border bg-white py-2.5 pl-10 pr-10 text-xs sm:text-sm text-neutral-900 placeholder-neutral-400 shadow-2xs outline-none transition focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 ${
                    errors.password ? "border-rose-300 ring-2 ring-rose-200/50" : "border-neutral-200"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  <span>{errors.password}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-neutral-800 mb-1.5">
                Xác nhận mật khẩu <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword)
                      setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                  }}
                  placeholder="Nhập lại mật khẩu"
                  className={`w-full rounded-xl border bg-white py-2.5 pl-10 pr-10 text-xs sm:text-sm text-neutral-900 placeholder-neutral-400 shadow-2xs outline-none transition focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 ${
                    errors.confirmPassword
                      ? "border-rose-300 ring-2 ring-rose-200/50"
                      : "border-neutral-200"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  <span>{errors.confirmPassword}</span>
                </p>
              )}
            </div>
          </div>

          {/* Policy / Note Info */}
          <div className="rounded-2xl border border-amber-200/70 bg-amber-50/50 p-3 sm:p-3.5 flex items-start gap-2.5 text-xs text-neutral-600">
            <Info className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Tài khoản mới sẽ được tạo với vai trò <strong>Người dùng (USER)</strong> và ở trạng thái <strong>Chờ phê duyệt</strong>. Quản trị viên có thể duyệt hoặc nâng cấp quyền sau trong bảng danh sách.
            </p>
          </div>

          {/* Modal Footer / Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isPending}
              className="rounded-xl border-neutral-300 text-neutral-700 hover:bg-neutral-100 text-xs sm:text-sm px-4 py-2 font-medium"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs sm:text-sm px-5 py-2 font-semibold shadow-xs transition"
            >
              {isPending ? (
                <>
                  <span className="h-3.5 w-3.5 border-2 border-white/80 border-t-transparent rounded-full animate-spin" />
                  <span>Đang tạo tài khoản...</span>
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  <span>Tạo tài khoản</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
