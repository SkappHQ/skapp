import { SignInStatus } from "~community/auth/enums/auth";
import { AuthResponseType } from "~community/auth/types/auth";

export interface EnterpriseSignInParams {
  email?: string;
  password?: string;
  method?: string;
  redirect?: boolean;
}

export interface EnterpriseSignUpParams {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  method?: string;
}

export const enterpriseSignIn = async (
  _params: EnterpriseSignInParams
): Promise<AuthResponseType> => {
  return { status: SignInStatus.FAILURE };
};

export const enterpriseSignUp = async (
  _params: EnterpriseSignUpParams
): Promise<AuthResponseType> => {
  return { status: SignInStatus.FAILURE };
};
