import { PermissionItemType } from "@/api/permission/permission.type";
import { ApprovalStatusEnum, RoleEnum } from "@/enums";

export interface UserItemType {
  id: string;
  email: string;
  name?: string;
  role: RoleEnum | string;
  approvalStatus?: ApprovalStatusEnum | string;
  permissions: PermissionItemType[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserPayloadType {
  email: string;
  password: string;
  name?: string;
  role?: RoleEnum | string;
  approvalStatus?: ApprovalStatusEnum | string;
}

export interface UpgradeRolePayloadType {
  userId: string;
  role: RoleEnum | string;
  permissionIds?: string[];
}

export interface AssignPermissionsPayloadType {
  userId: string;
  permissionIds: string[];
}

export interface UpdateApprovalStatusPayloadType {
  userId: string;
  status: ApprovalStatusEnum | string;
}

export interface UpgradeRoleResponse {
  data: UserItemType;
}

export interface AssignPermissionsResponse {
  data: UserItemType;
}

export interface UpdateApprovalStatusResponse {
  data: UserItemType;
}

