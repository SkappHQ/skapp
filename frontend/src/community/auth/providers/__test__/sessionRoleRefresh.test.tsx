import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import { InternalAxiosRequestConfig } from "axios";

import authAxios from "~community/auth/utils/authInterceptor";
import { COMMON_ERROR_USER_VERSION_MISMATCH } from "~community/common/constants/errorMessageKeys";
import TanStackProvider from "~community/common/providers/TanStackProvider";
import { useCommonStore } from "~community/common/stores/commonStore";
import { RepresentativeTypes } from "~community/common/types/AuthTypes";
import authFetch from "~community/common/utils/axiosInterceptor";

import { AuthProvider, useAuth } from "../AuthProvider";

jest.mock("next/router", () => ({
  useRouter: () => ({ query: {}, asPath: "/crm/deals" })
}));

jest.mock("../../../common/providers/ToastProvider", () => ({
  useToast: () => ({ setToastMessage: jest.fn() })
}));

// The real loader pulls in the translation runtime
jest.mock(
  "../../../common/components/molecules/FullScreenLoader/FullScreenLoader",
  () => ({
    __esModule: true,
    default: (): React.ReactElement => <div>loading</div>
  })
);

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
  "ROLE_CRM_SALES_REPRESENTATIVE"
]);

const TOKEN_WITHOUT_CRM = createToken(["ROLE_PEOPLE_EMPLOYEE"]);

const rejectWithVersionMismatch = (): void => {
  authFetch.defaults.adapter = async (
    config: InternalAxiosRequestConfig
  ): Promise<never> => {
    throw Object.assign(new Error("Request failed with status code 401"), {
      isAxiosError: true,
      config,
      response: {
        data: {
          results: [{ messageKey: COMMON_ERROR_USER_VERSION_MISMATCH }]
        },
        status: 401,
        statusText: "Unauthorized",
        headers: {},
        config
      }
    });
  };
};

const resolveRefreshWith = (accessToken: string): void => {
  authAxios.defaults.adapter = async (config: InternalAxiosRequestConfig) => ({
    data: { results: [{ accessToken }] },
    status: 200,
    statusText: "OK",
    headers: {},
    config
  });
};

// Stands in for the Drawer, which builds its routes from user?.roles
const SidebarProbe = (): React.ReactElement => {
  const { user } = useAuth();

  return (
    <div data-testid="sidebar">
      {user?.roles?.includes(RepresentativeTypes.CRM_SALES_REPRESENTATIVE)
        ? "CRM VISIBLE"
        : "CRM HIDDEN"}
    </div>
  );
};

describe("the session roles every role-driven UI reads", () => {
  test("drop out of user.roles once the refreshed token lands", async () => {
    useCommonStore.setState({ accessToken: TOKEN_WITH_CRM });
    rejectWithVersionMismatch();
    resolveRefreshWith(TOKEN_WITHOUT_CRM);

    render(
      <AuthProvider>
        <TanStackProvider>
          <SidebarProbe />
        </TanStackProvider>
      </AuthProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId("sidebar")).toHaveTextContent("CRM VISIBLE")
    );

    await authFetch.get("/crm/deals");

    await waitFor(() =>
      expect(useCommonStore.getState().accessToken).toBe(TOKEN_WITHOUT_CRM)
    );

    await waitFor(() =>
      expect(screen.getByTestId("sidebar")).toHaveTextContent("CRM HIDDEN")
    );
  });
});
