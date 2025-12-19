import {
  AdminTypes,
  AuthEmployeeType,
  EmployeeTypes,
  ManagerTypes,
  SenderTypes,
  SuperAdminType
} from "~community/common/types/AuthTypes";
import { TenantStatusEnums, TierEnum } from "~enterprise/common/enums/Common";

export interface CustomUser {
  id: string;
  name: string;
  email?: string;
  roles?: (
    | AdminTypes
    | ManagerTypes
    | EmployeeTypes
    | SuperAdminType
    | SenderTypes
  )[];
  accessToken?: string;
  refreshToken?: string;
  tokenDuration?: number;
  isPasswordChangedForTheFirstTime?: boolean;
  employee?: AuthEmployeeType;
  provider?: string;
  authPic?: string;
  idToken?: string;
  tier?: TierEnum;
  tenantId?: string;
  tenantStatus?: TenantStatusEnums;
  userId?: number;
  isTemporaryUser?: boolean;
}

export interface CustomSession {
  user: CustomUser;
  expires: string;
}

export type SessionStatus = "loading" | "authenticated" | "unauthenticated";

export interface AuthContextValue {
  data: CustomSession | null;
  status: SessionStatus;
  update: () => Promise<void>;
  refreshToken?: () => Promise<string | null>;
}

export interface SignInCredentials {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  tenantId?: string;
  method?: string;
  code?: string;
  organizationId?: string;
  email_otp?: string;
}

export interface SignInOptions {
  redirect?: boolean;
  callbackUrl?: string;
}

export interface SignInResponse {
  error?: string;
  status: number;
  ok: boolean;
  url?: string;
}

export interface SignOutOptions {
  redirect?: boolean;
  callbackUrl?: string;
}
