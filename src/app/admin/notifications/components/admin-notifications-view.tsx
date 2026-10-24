"use client";

import {
  AlertCircle,
  Bell,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  FileText,
  Flame,
  Info,
  Radio,
  RefreshCw,
  Send,
  Smartphone,
  Sparkles,
  User,
  Users,
  Volume2,
  VolumeX,
} from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";

import {
  useBroadcastNotification,
  useSendNotification,
} from "@/api/notification";
import type { SendNotificationResult } from "@/api/notification/notification.type";
import { useGetUsers } from "@/api/user/user.hook";
import { LotusLogo } from "@/components/shared/lotus-logo";
import { Button } from "@/components/ui";

export const AdminNotificationsView: React.FC = () => {
  const [targetMode, setTargetMode] = useState<"BROADCAST" | "TARGETED">(
    "BROADCAST"
  );
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [title, setTitle] = useState("Khai thị mới hôm nay");
  const [body, setBody] = useState(
    "Ban Quản Trị vừa đăng tải bài pháp thoại mới. Kính mời quý đồng tu cùng đón đọc và chiêm nghiệm."
  );
  const [route, setRoute] = useState("/explore");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [badgeCount, setBadgeCount] = useState<number>(1);
  const [channelId] = useState("default");

  const [lastResult, setLastResult] =
    useState<SendNotificationResult | null>(null);
  const [lastSentAt, setLastSentAt] = useState<string | null>(null);

  // Fetch users for targeted sending
  const { data: users = [], isLoading: isLoadingUsers } = useGetUsers();

  // Mutations
  const sendMutation = useSendNotification({
    onSuccess: (result) => {
      setLastResult(result);
      setLastSentAt(new Date().toLocaleTimeString("vi-VN"));
      if (result.sentCount > 0) {
        toast.success(
          `Đã gửi thành công đến ${result.sentCount} thiết bị của người dùng!`
        );
      } else {
        toast.error(
          "Không tìm thấy thiết bị hoạt động nào cho người dùng này."
        );
      }
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Gửi thông báo thất bại";
      toast.error(msg);
    },
  });

  const broadcastMutation = useBroadcastNotification({
    onSuccess: (result) => {
      setLastResult(result);
      setLastSentAt(new Date().toLocaleTimeString("vi-VN"));
      if (result.sentCount > 0) {
        toast.success(
          `Đã phát thông báo thành công đến ${result.sentCount} thiết bị!`
        );
      } else {
        toast.error(
          "Không có thiết bị di động nào đang đăng ký nhận thông báo."
        );
      }
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Phát sóng thông báo thất bại";
      toast.error(msg);
    },
  });

  const isSending = sendMutation.isPending || broadcastMutation.isPending;

  // Quick preset helper
  const applyPreset = (preset: {
    title: string;
    body: string;
    route: string;
  }) => {
    setTitle(preset.title);
    setBody(preset.body);
    setRoute(preset.route);
    toast.success("Đã áp dụng mẫu thông báo");
  };

  const handleSend = () => {
    if (!title.trim()) {
      toast.error("Vui lòng nhập tiêu đề thông báo");
      return;
    }
    if (!body.trim()) {
      toast.error("Vui lòng nhập nội dung thông báo");
      return;
    }

    const payload = {
      title: title.trim(),
      body: body.trim(),
      data: {
        route: route.trim(),
        url: route.trim(),
      },
      sound: soundEnabled ? ("default" as const) : null,
      badge: badgeCount > 0 ? badgeCount : undefined,
      channelId,
    };

    if (targetMode === "BROADCAST") {
      broadcastMutation.mutate(payload);
    } else {
      if (!selectedUserId) {
        toast.error("Vui lòng chọn người dùng nhận thông báo");
        return;
      }
      sendMutation.mutate({
        ...payload,
        userId: selectedUserId,
      });
    }
  };

  return (
    <div className="space-y-8 p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#EDE5D8] pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-900">
              <Bell className="h-6 w-6" />
            </div>
            <h1
              className="text-2xl lg:text-3xl font-bold text-amber-950"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Gửi & Thử Nghiệm Thông Báo Push
            </h1>
          </div>
          <p className="mt-1.5 text-sm text-neutral-600">
            Gửi thông báo đẩy đến ứng dụng di động qua Expo Push Notification Service.
          </p>
        </div>

        {/* Quick action presets */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() =>
              applyPreset({
                title: "Thử nghiệm thông báo 🔔",
                body: "Đây là thông báo thử nghiệm từ trang quản trị Phật Pháp. Thiết bị của bạn đã nhận được thành công!",
                route: "/explore",
              })
            }
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Điền mẫu test
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Target Audience Switcher */}
          <div className="bg-white/80 rounded-2xl border border-[#EDE5D8] p-5 shadow-xs">
            <label className="block text-xs font-bold uppercase tracking-wider text-amber-900/80 mb-3">
              1. Đối tượng nhận thông báo
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTargetMode("BROADCAST")}
                className={`flex items-center justify-center gap-2.5 p-3.5 rounded-xl border text-sm font-semibold transition-all ${
                  targetMode === "BROADCAST"
                    ? "bg-[#F3E8D8] border-[#9C5812] text-[#9C5812] shadow-xs"
                    : "bg-white border-[#EDE5D8] text-neutral-600 hover:border-amber-300"
                }`}
              >
                <Radio className="h-4 w-4" />
                <span>Toàn bộ thiết bị (Broadcast)</span>
              </button>

              <button
                type="button"
                onClick={() => setTargetMode("TARGETED")}
                className={`flex items-center justify-center gap-2.5 p-3.5 rounded-xl border text-sm font-semibold transition-all ${
                  targetMode === "TARGETED"
                    ? "bg-[#F3E8D8] border-[#9C5812] text-[#9C5812] shadow-xs"
                    : "bg-white border-[#EDE5D8] text-neutral-600 hover:border-amber-300"
                }`}
              >
                <User className="h-4 w-4" />
                <span>Người dùng cụ thể</span>
              </button>
            </div>

            {/* User Selector dropdown if TARGETED */}
            {targetMode === "TARGETED" && (
              <div className="mt-4 pt-4 border-t border-[#EDE5D8]">
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Chọn người dùng nhận thông báo
                </label>
                {isLoadingUsers ? (
                  <div className="h-10 w-full rounded-xl bg-neutral-100 animate-pulse" />
                ) : (
                  <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="w-full rounded-xl border border-[#EDE5D8] bg-white px-3.5 py-2.5 text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-amber-600"
                  >
                    <option value="">-- Chọn người dùng --</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name || "Chưa đặt tên"} ({u.email}) - Vai trò:{" "}
                        {u.role}
                      </option>
                    ))}
                  </select>
                )}
                <p className="mt-1.5 text-xs text-neutral-500">
                  Thông báo sẽ được gửi đến tất cả thiết bị mà người dùng này đã đăng nhập.
                </p>
              </div>
            )}
          </div>

          {/* Notification Content Form */}
          <div className="bg-white/80 rounded-2xl border border-[#EDE5D8] p-5 shadow-xs space-y-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-amber-900/80">
              2. Nội dung thông báo
            </label>

            {/* Title */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-neutral-700">
                  Tiêu đề <span className="text-red-500">*</span>
                </label>
                <span className="text-[11px] text-neutral-400">
                  {title.length}/255
                </span>
              </div>
              <input
                type="text"
                value={title}
                maxLength={255}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nhập tiêu đề thông báo..."
                className="w-full rounded-xl border border-[#EDE5D8] bg-white px-3.5 py-2.5 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-amber-600"
              />
            </div>

            {/* Body */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-neutral-700">
                  Nội dung <span className="text-red-500">*</span>
                </label>
                <span className="text-[11px] text-neutral-400">
                  {body.length}/1000
                </span>
              </div>
              <textarea
                rows={3}
                value={body}
                maxLength={1000}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Nhập nội dung thông báo gửi đến người dùng..."
                className="w-full rounded-xl border border-[#EDE5D8] bg-white px-3.5 py-2.5 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-amber-600"
              />
            </div>

            {/* Navigation route / deep link */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Đường dẫn điều hướng khi người dùng chạm vào (Deep link)
              </label>
              <input
                type="text"
                value={route}
                onChange={(e) => setRoute(e.target.value)}
                placeholder="Ví dụ: /explore hoặc /favorites hoặc /posts/slug/ten-bai-viet"
                className="w-full rounded-xl border border-[#EDE5D8] bg-white px-3.5 py-2.5 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-amber-600"
              />
              <div className="flex gap-2 mt-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setRoute("/")}
                  className="px-2.5 py-1 text-xs rounded-md bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                >
                  Trang chủ (/)
                </button>
                <button
                  type="button"
                  onClick={() => setRoute("/explore")}
                  className="px-2.5 py-1 text-xs rounded-md bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                >
                  Khám phá (/explore)
                </button>
                <button
                  type="button"
                  onClick={() => setRoute("/favorites")}
                  className="px-2.5 py-1 text-xs rounded-md bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                >
                  Yêu thích (/favorites)
                </button>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="pt-3 border-t border-[#EDE5D8]">
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-2">
                Mẫu soạn sẵn:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    applyPreset({
                      title: "Khai thị mới 📜",
                      body: "Kính mời quý Phật tử lắng nghe trích đoạn khai thị quý báu vừa được cập nhật hôm nay.",
                      route: "/explore",
                    })
                  }
                  className="p-2.5 text-left rounded-xl border border-[#EDE5D8] bg-[#FBF9F4] hover:border-amber-400 transition-colors"
                >
                  <p className="text-xs font-semibold text-amber-950">
                    Khai thị mới
                  </p>
                  <p className="text-[11px] text-neutral-500 truncate mt-0.5">
                    Thông báo bài pháp thoại
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    applyPreset({
                      title: "Nhắc nhở niệm Phật 🙏",
                      body: "Một nụ cười hoan hỷ, giữ tâm thanh tịnh và an lạc trong từng phút giây.",
                      route: "/",
                    })
                  }
                  className="p-2.5 text-left rounded-xl border border-[#EDE5D8] bg-[#FBF9F4] hover:border-amber-400 transition-colors"
                >
                  <p className="text-xs font-semibold text-amber-950">
                    Nhắc nhở niệm Phật
                  </p>
                  <p className="text-[11px] text-neutral-500 truncate mt-0.5">
                    Lời nhắc tinh tấn tu học
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    applyPreset({
                      title: "Nghi thức tụng kinh 🕯️",
                      body: "Đã có bản audio tụng kinh âm thanh rõ ràng, mời quý vị cùng lắng nghe.",
                      route: "/favorites",
                    })
                  }
                  className="p-2.5 text-left rounded-xl border border-[#EDE5D8] bg-[#FBF9F4] hover:border-amber-400 transition-colors"
                >
                  <p className="text-xs font-semibold text-amber-950">
                    Nghi thức tụng kinh
                  </p>
                  <p className="text-[11px] text-neutral-500 truncate mt-0.5">
                    Thông báo audio mới
                  </p>
                </button>
              </div>
            </div>

            {/* Options: Sound, Badge */}
            <div className="pt-3 border-t border-[#EDE5D8] flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={(e) => setSoundEnabled(e.target.checked)}
                  className="h-4 w-4 rounded border-neutral-300 text-amber-700 focus:ring-amber-500"
                />
                <span className="text-xs font-medium text-neutral-700 flex items-center gap-1.5">
                  {soundEnabled ? (
                    <Volume2 className="h-3.5 w-3.5 text-green-600" />
                  ) : (
                    <VolumeX className="h-3.5 w-3.5 text-neutral-400" />
                  )}
                  Âm thanh chuông báo
                </span>
              </label>

              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-neutral-700">
                  Badge:
                </span>
                <input
                  type="number"
                  min={0}
                  max={99}
                  value={badgeCount}
                  onChange={(e) => setBadgeCount(parseInt(e.target.value) || 0)}
                  className="w-16 rounded-lg border border-[#EDE5D8] px-2 py-1 text-xs text-center"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="golden"
              size="lg"
              isLoading={isSending}
              onClick={handleSend}
              leftIcon={<Send className="h-4 w-4" />}
              className="px-6 py-2.5 font-bold shadow-lg"
            >
              {targetMode === "BROADCAST"
                ? "Phát sóng thông báo toàn hệ thống"
                : "Gửi thông báo tới người dùng"}
            </Button>
          </div>
        </div>

        {/* Right Column: Phone Preview Mockup & Result History (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Phone Notification Preview */}
          <div className="bg-white/80 rounded-2xl border border-[#EDE5D8] p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-amber-800" />
                <span className="text-xs font-bold uppercase tracking-wider text-amber-950">
                  Xem trước trên điện thoại
                </span>
              </div>
              <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                Thời gian thực
              </span>
            </div>

            {/* Mobile notification banner mockup */}
            <div className="relative mx-auto w-full rounded-2xl border border-neutral-300/80 bg-neutral-900/95 p-3.5 text-white shadow-xl backdrop-blur-md">
              <div className="flex items-start gap-3">
                {/* App icon */}
                <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 p-1.5 flex items-center justify-center shadow-md">
                  <LotusLogo size={24} />
                </div>

                {/* Notification body */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-amber-200 tracking-wide uppercase">
                      Phật Pháp
                    </span>
                    <span className="text-[10px] text-neutral-400 flex items-center gap-1">
                      <Clock className="h-2.5 w-2.5" /> Vừa xong
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-neutral-100 leading-snug mt-0.5 line-clamp-1">
                    {title || "(Chưa có tiêu đề)"}
                  </h4>

                  <p className="text-xs text-neutral-300 leading-relaxed mt-1 line-clamp-3">
                    {body || "(Chưa có nội dung thông báo)"}
                  </p>

                  {route && (
                    <div className="mt-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-neutral-800 border border-neutral-700 text-[10px] text-amber-300">
                      <ChevronRight className="h-3 w-3" />
                      <span>Chạm để mở: {route}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <p className="mt-3 text-center text-[11px] text-neutral-500">
              Mô phỏng thông báo dạng banner trên màn hình khóa / thông báo của iOS & Android.
            </p>
          </div>

          {/* Last Send Results Box */}
          <div className="bg-white/80 rounded-2xl border border-[#EDE5D8] p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                <Info className="h-4 w-4 text-amber-800" />
                Kết quả gửi gần nhất
              </span>
              {lastSentAt && (
                <span className="text-xs text-neutral-500">
                  Lúc: {lastSentAt}
                </span>
              )}
            </div>

            {lastResult ? (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
                    <span className="block text-xs text-neutral-500">
                      Đã nhắm tới
                    </span>
                    <span className="text-lg font-bold text-amber-900">
                      {lastResult.totalTokens}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                    <span className="block text-xs text-emerald-700">
                      Thành công
                    </span>
                    <span className="text-lg font-bold text-emerald-800">
                      {lastResult.sentCount}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200">
                    <span className="block text-xs text-rose-700">Lỗi / Hỏng</span>
                    <span className="text-lg font-bold text-rose-800">
                      {lastResult.failedCount}
                    </span>
                  </div>
                </div>

                {lastResult.deactivatedCount > 0 && (
                  <div className="p-2.5 rounded-xl bg-amber-100/70 border border-amber-300 text-xs text-amber-900 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0 text-amber-700" />
                    <span>
                      Đã tự động dọn dẹp {lastResult.deactivatedCount} token không còn hoạt động (DeviceNotRegistered).
                    </span>
                  </div>
                )}

                {/* Tickets detail preview */}
                {lastResult.tickets.length > 0 && (
                  <div className="mt-3">
                    <span className="text-[11px] font-semibold text-neutral-500 block mb-1">
                      Chi tiết Push Tickets:
                    </span>
                    <div className="max-h-36 overflow-y-auto space-y-1 text-xs">
                      {lastResult.tickets.map((t, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-1.5 rounded-lg bg-neutral-50 border border-neutral-200"
                        >
                          <span className="flex items-center gap-1.5 text-neutral-700 font-mono text-[11px]">
                            {t.status === "ok" ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                            ) : (
                              <AlertCircle className="h-3.5 w-3.5 text-rose-600" />
                            )}
                            {t.id || t.message || "Ticket #" + (idx + 1)}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              t.status === "ok"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {t.status.toUpperCase()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6 text-neutral-400">
                <Bell className="h-8 w-8 mx-auto stroke-1 opacity-50 mb-2" />
                <p className="text-xs">Chưa có thông báo nào được gửi trong phiên làm việc này.</p>
              </div>
            )}
          </div>

          {/* Device requirements notice */}
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-950 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-amber-900">
              <Sparkles className="h-4 w-4" />
              Lưu ý khi kiểm tra trên thiết bị di động:
            </div>
            <ul className="list-disc list-inside space-y-1 text-neutral-700 pl-1 leading-relaxed">
              <li>
                Expo Push Notification yêu cầu thiết bị <strong>thật (physical device)</strong> để nhận thông báo từ máy chủ APNs (iOS) hoặc FCM (Android).
              </li>
              <li>
                Người dùng cần mở app và đồng ý cho phép nhận thông báo ít nhất một lần để token được ghi nhận vào hệ thống.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
