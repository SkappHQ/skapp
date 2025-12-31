import { User } from "~community/auth/utils/authUtils";
import { EnterpriseSignInParams, EnterpriseSignUpParams } from "~enterprise/auth/utils/authUtils";

import { SignInStatus } from "../enums/auth";

export interface AuthContextType {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: User | null;
  signIn: (params: EnterpriseSignInParams) => Promise<SignInStatus>;
  signUp: (params: EnterpriseSignUpParams) => Promise<SignInStatus>;
  signOut: (redirect?: boolean) => Promise<void>;
  refreshAccessToken: () => Promise<string | null>;
}
