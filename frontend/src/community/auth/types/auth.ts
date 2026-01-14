import { User } from "~community/auth/utils/authUtils";
import { EnterpriseSignInParams, EnterpriseSignUpParams } from "~enterprise/auth/utils/authUtils";

import { SignInStatus } from "../enums/auth";

export interface AuthContextType {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: User | null;
  signIn: (params: EnterpriseSignInParams) => Promise<AuthResponseType>;
  signUp: (params: EnterpriseSignUpParams) => Promise<AuthResponseType>;
  signOut: (redirect?: boolean) => Promise<void>;
  refreshAccessToken: () => Promise<string | null>;
}

export interface AuthResponseType {
  status: SignInStatus;
  error?: string;
}