import { User, EnterpriseSignInParams } from "~enterprise/auth/utils/authUtils";
import { SignInStatus } from "../enums/auth";

export interface AuthContextType {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: User | null;
  signIn: (params: EnterpriseSignInParams) => Promise<SignInStatus>;
  signOut: (redirect?: boolean) => Promise<void>;
  refreshAccessToken: () => Promise<SignInStatus>;
}