import { renderHook, waitFor } from "@testing-library/react";

import { setAccessToken } from "~community/auth/utils/authUtils";
import ROUTES from "~community/common/constants/routes";
import { useCommonStore } from "~community/common/stores/commonStore";

import useModuleAccessGuard from "../useModuleAccessGuard";

const replace = jest.fn();

jest.mock("next/router", () => ({
  useRouter: () => ({ asPath: "/crm/deals", replace })
}));

const createToken = (roles: string[]): string => {
  const claims = { sub: "u", userId: 42, roles, exp: Math.floor(Date.now() / 1000) + 3600 };
  return `header.${Buffer.from(JSON.stringify(claims)).toString("base64url")}.sig`;
};

const WITH_CRM = createToken([
  "ROLE_PEOPLE_EMPLOYEE",
  "ROLE_CRM_SALES_REPRESENTATIVE"
]);
const WITHOUT_CRM = createToken(["ROLE_PEOPLE_EMPLOYEE"]);

describe("the real refresh path drives the guard", () => {
  test("setAccessToken (what getNewAccessToken calls) triggers the redirect", async () => {
    useCommonStore.setState({ accessToken: WITH_CRM });

    renderHook(() => useModuleAccessGuard());

    expect(replace).not.toHaveBeenCalled();

    await setAccessToken(WITHOUT_CRM, useCommonStore.getState());

    await waitFor(() =>
      expect(replace).toHaveBeenCalledWith(ROUTES.DASHBOARD.BASE)
    );
  });
});
