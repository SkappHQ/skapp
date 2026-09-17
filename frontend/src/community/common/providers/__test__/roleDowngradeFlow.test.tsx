import "@testing-library/jest-dom";
import { render, waitFor } from "@testing-library/react";
import { InternalAxiosRequestConfig } from "axios";

import authAxios from "~community/auth/utils/authInterceptor";
import ROUTES from "~community/common/constants/routes";
import { COMMON_ERROR_USER_VERSION_MISMATCH } from "~community/common/constants/errorMessageKeys";
import useModuleAccessGuard from "~community/common/hooks/useModuleAccessGuard";
import TanStackProvider from "~community/common/providers/TanStackProvider";
import { useCommonStore } from "~community/common/stores/commonStore";
import authFetch from "~community/common/utils/axiosInterceptor";

const replace = jest.fn();
const checkAuth = jest.fn();

jest.mock("next/router", () => ({
  useRouter: () => ({ asPath: "/crm/deals", replace })
}));

jest.mock("~community/auth/providers/AuthProvider", () => ({
  useAuth: () => ({ user: null, checkAuth })
}));

jest.mock("../ToastProvider", () => ({
  useToast: () => ({ setToastMessage: jest.fn() })
}));

const ONE_HOUR_IN_SECONDS = 60 * 60;

const createToken = (roles: string[]): string => {
  const claims = {
    sub: "downgraded.user@skapp.com",
    userId: 42,
    roles,
    exp: Math.floor(Date.now() / 1000) + ONE_HOUR_IN_SECONDS
  };

  return `header.${Buffer.from(JSON.stringify(claims)).toString("base64url")}.sig`;
};

const TOKEN_WITH_CRM = createToken([
  "ROLE_PEOPLE_EMPLOYEE",
  "ROLE_CRM_ADMIN",
  "ROLE_CRM_SALES_MANAGER",
  "ROLE_CRM_SALES_REPRESENTATIVE"
]);

const TOKEN_WITHOUT_CRM = createToken(["ROLE_PEOPLE_EMPLOYEE"]);

const rejectWith =
  (status: number, messageKey: string) =>
  async (config: InternalAxiosRequestConfig): Promise<never> => {
    throw Object.assign(
      new Error(`Request failed with status code ${status}`),
      {
        isAxiosError: true,
        config,
        response: {
          data: { results: [{ messageKey }] },
          status,
          statusText: "Unauthorized",
          headers: {},
          config
        }
      }
    );
  };

const respondWithVersionMismatch = (): void => {
  authFetch.defaults.adapter = rejectWith(
    401,
    COMMON_ERROR_USER_VERSION_MISMATCH
  );
};

const respondToRefreshWith = (accessToken: string): void => {
  authAxios.defaults.adapter = async (
    config: InternalAxiosRequestConfig
  ) => ({
    data: { results: [{ accessToken }] },
    status: 200,
    statusText: "OK",
    headers: {},
    config
  });
};

const GuardedPage = (): React.ReactElement => {
  useModuleAccessGuard();

  return <div>crm deals</div>;
};

beforeEach(() => {
  jest.clearAllMocks();
  useCommonStore.setState({ accessToken: TOKEN_WITH_CRM });
});

describe("a CRM role downgraded while the user sits on a CRM page", () => {
  test("the whole chain runs: 401 -> refresh -> new roles -> dashboard", async () => {
    respondWithVersionMismatch();
    respondToRefreshWith(TOKEN_WITHOUT_CRM);

    render(
      <TanStackProvider>
        <GuardedPage />
      </TanStackProvider>
    );

    expect(replace).not.toHaveBeenCalled();

    await authFetch.get("/crm/deals");

    await waitFor(() =>
      expect(useCommonStore.getState().accessToken).toBe(TOKEN_WITHOUT_CRM)
    );

    await waitFor(() =>
      expect(replace).toHaveBeenCalledWith(ROUTES.DASHBOARD.BASE)
    );
  });

  test("a 401 that is not a version mismatch changes nothing", async () => {
    authFetch.defaults.adapter = rejectWith(401, "SOME_OTHER_ERROR");

    render(
      <TanStackProvider>
        <GuardedPage />
      </TanStackProvider>
    );

    await authFetch.get("/crm/deals");

    expect(useCommonStore.getState().accessToken).toBe(TOKEN_WITH_CRM);
    expect(replace).not.toHaveBeenCalled();
  });

  test("a downgrade that keeps CRM access does not move the user", async () => {
    respondWithVersionMismatch();
    respondToRefreshWith(
      createToken(["ROLE_PEOPLE_EMPLOYEE", "ROLE_CRM_SALES_REPRESENTATIVE"])
    );

    render(
      <TanStackProvider>
        <GuardedPage />
      </TanStackProvider>
    );

    await authFetch.get("/crm/deals");

    await waitFor(() =>
      expect(useCommonStore.getState().accessToken).not.toBe(TOKEN_WITH_CRM)
    );

    expect(replace).not.toHaveBeenCalled();
  });

  test("a failed refresh leaves the user where they are", async () => {
    respondWithVersionMismatch();

    authAxios.defaults.adapter = async () => {
      throw new Error("refresh endpoint unreachable");
    };

    render(
      <TanStackProvider>
        <GuardedPage />
      </TanStackProvider>
    );

    await authFetch.get("/crm/deals");

    expect(useCommonStore.getState().accessToken).toBe(TOKEN_WITH_CRM);
    expect(replace).not.toHaveBeenCalled();
  });
});
