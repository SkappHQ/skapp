import { ApiVersions } from "~community/common/constants/configs";

export const authenticationEndpoints = {
  REFRESH_TOKEN: `${ApiVersions.V1}/auth/session/refresh-token`,
  SIGNOUT: `${ApiVersions.V1}/auth/session/sign-out`
};
