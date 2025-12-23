import {
  AuthMethods,
  EnterpriseSignInParams,
  SignInStatus,
  User,
  enterpriseSignIn,
  extractUserFromToken,
  getAccessToken
} from "~enterprise/auth/utils/authUtils";

export const handleSignIn = async (
  params: EnterpriseSignInParams
): Promise<SignInStatus> => {
  const response = await enterpriseSignIn({
    email: params.email,
    password: params.password,
    method: AuthMethods.CREDENTIAL
  });

  if (response !== SignInStatus.SUCCESS) {
    throw new Error("Login failed");
  }

  return response;
};

export const checkUserAuthentication = async (): Promise<User | null> => {
  const token = await getAccessToken();

  if (!token) {
    return null;
  }

  const userData = extractUserFromToken(token);

  if (!userData) {
    // Token expired or invalid
    localStorage.removeItem("accessToken");
    return null;
  }

  return userData;
};

export const handleRefreshToken = async (): Promise<SignInStatus> => {
  // TODO: Implement refresh token logic
  return SignInStatus.SUCCESS;
};
