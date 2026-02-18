import { SignInStatus } from "~community/auth/enums/auth";
import { AuthResponseType } from "~community/auth/types/auth";

export const enterpriseSignIn = async (): Promise<AuthResponseType> => {
  return { status: SignInStatus.FAILURE };
};

export const enterpriseSignUp = async (): Promise<AuthResponseType> => {
  return { status: SignInStatus.FAILURE };
};
