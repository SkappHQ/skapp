import { User } from "~enterprise/auth/utils/authUtils";

export interface AuthContextType {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: User | null;
  signIn: (params: SignInParams) => Promise<SignInStatus>;
  signOut: (redirect?: boolean) => Promise<void>;
  updateSession: () => Promise<void>;
}

export interface SignInParams {
  email: string;
  password: string;
  redirect?: boolean;
}

export enum SignInStatus {
  SUCCESS = "SUCCESS",
  FAILURE = "FAILURE"
}
