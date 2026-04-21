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
): Promise<void> => {};

export const enterpriseSignUp = async (
  _params: EnterpriseSignUpParams
): Promise<void> => {};
