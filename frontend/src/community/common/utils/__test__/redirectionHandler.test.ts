import { getSession } from "next-auth/react";

import { HTTP_OK } from "~community/common/constants/httpStatusCodes";
import ROUTES from "~community/common/constants/routes";
import authFetch from "~community/common/utils/axiosInterceptor";

import { redirectHandler } from "../redirectionHandler";

jest.mock("next-auth/react");
jest.mock("~community/common/utils/axiosInterceptor");

describe("redirectHandler", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should redirect to SIGNUP if organization setup is incomplete", async () => {
    (getSession as jest.Mock).mockResolvedValue(null);
    (authFetch.get as jest.Mock).mockResolvedValue({
      status: HTTP_OK,
      data: { results: [{ isSignUpCompleted: false }] }
    });

    const result = await redirectHandler(undefined, { isSignInPage: false });

    expect(result).toEqual({
      redirect: {
        destination: ROUTES.AUTH.SIGNUP,
        permanent: false
      }
    });
  });

  it("should redirect to ORGANIZATION SETUP if signup is complete but organization setup is incomplete", async () => {
    (getSession as jest.Mock).mockResolvedValue({ user: {} });
    (authFetch.get as jest.Mock).mockResolvedValue({
      status: HTTP_OK,
      data: {
        results: [
          { isSignUpCompleted: true, isOrganizationSetupCompleted: false }
        ]
      }
    });

    const result = await redirectHandler(undefined, { isSignInPage: false });

    expect(result).toEqual({
      redirect: {
        destination: ROUTES.ORGANIZATION.SETUP,
        permanent: false
      }
    });
  });

  it("should redirect to RESET_PASSWORD if the user has not changed their password", async () => {
    (getSession as jest.Mock).mockResolvedValue({
      user: { isPasswordChangedForTheFirstTime: false }
    });
    (authFetch.get as jest.Mock).mockResolvedValue({
      status: HTTP_OK,
      data: {
        results: [
          { isSignUpCompleted: true, isOrganizationSetupCompleted: true }
        ]
      }
    });

    const result = await redirectHandler(undefined, { isSignInPage: false });

    expect(result).toEqual({
      redirect: {
        destination: ROUTES.AUTH.RESET_PASSWORD,
        permanent: false
      }
    });
  });

  it("should redirect to DASHBOARD if the user is authenticated and setup is complete", async () => {
    (getSession as jest.Mock).mockResolvedValue({
      user: { isPasswordChangedForTheFirstTime: true }
    });
    (authFetch.get as jest.Mock).mockResolvedValue({
      status: HTTP_OK,
      data: {
        results: [
          { isSignUpCompleted: true, isOrganizationSetupCompleted: true }
        ]
      }
    });

    const result = await redirectHandler(undefined, { isSignInPage: false });

    expect(result).toEqual({
      redirect: {
        destination: ROUTES.DASHBOARD.BASE,
        permanent: false
      }
    });
  });

  it("should return session and orgSetupStatus as null if on the sign-in page", async () => {
    (getSession as jest.Mock).mockResolvedValue(null);

    const result = await redirectHandler(undefined, { isSignInPage: true });

    expect(result).toEqual({
      props: {
        session: null,
        orgSetupStatus: null
      }
    });
  });

  it("should redirect to SIGNIN if the user is not authenticated and not on the sign-in page", async () => {
    (getSession as jest.Mock).mockResolvedValue(null);

    const result = await redirectHandler(undefined, { isSignInPage: false });

    expect(result).toEqual({
      redirect: {
        destination: ROUTES.AUTH.SIGNIN,
        permanent: false
      }
    });
  });
});
