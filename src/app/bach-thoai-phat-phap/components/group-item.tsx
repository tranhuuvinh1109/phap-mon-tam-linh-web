"use client";

import { FolderTree } from "lucide-react";
import React from "react";

import type { GroupItemType } from "@/api/group";
import { slugify } from "@/lib/utils";

/**
 * Generate a URL-friendly slug for a group name
 */
export function getGroupSlug(name?: string | null): string {
  if (!name || name.toLowerCase() === "undefined" || name.toLowerCase() === "không xác định") {
    return "khong-xac-dinh";
  }
  return slugify(name);
}

export interface GroupItemProps {
  group: GroupItemType;
  isSelected: boolean;
  onSelect: (groupSlug: string) => void;
}

export const GroupItem: React.FC<GroupItemProps> = ({ group, isSelected, onSelect }) => {
  const groupSlug = getGroupSlug(group.name);
  const displayName = group.name.toLowerCase() === "undefined" ? "Chưa phân nhóm" : group.name;

  return (
    <button
      type="button"
      onClick={() => onSelect(groupSlug)}
      className={`inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl px-3.5 py-2 font-semibold transition ${
        isSelected
          ? "bg-gradient-to-r from-amber-700 to-amber-800 text-white shadow-xs"
          : "border border-neutral-200/80 bg-white text-neutral-700 hover:border-amber-300 hover:bg-amber-50/60"
      }`}
    >
      <FolderTree className="h-3.5 w-3.5 opacity-70" />
      <span>{displayName}</span>
    </button>
  );
};
