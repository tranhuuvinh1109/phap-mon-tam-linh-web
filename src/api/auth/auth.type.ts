export interface SignUpPayloadType {
  email: string;
  password: string;
  name?: string;
  fullName?: string;
}

export interface UserProfileResponseType {
  id: string;
  email: string;
  name?: string;
  fullName?: string;
  avatarUrl?: string;
  role?: string;
  approvalStatus?: string;
  createdAt?: string;
  updatedAt?: string;
  permissions?: string[];
}

export interface SignUpResponseType {
  message?: string;
  accessToken?: string;
  refreshToken?: string;
  user: UserProfileResponseType;
}

export interface SignInPayloadType {
  email: string;
  password: string;
}

export interface SignInResponseType {
  accessToken: string;
  refreshToken?: string;
  user: UserProfileResponseType;
}

export interface UserDetailResponseType extends UserProfileResponseType {}
