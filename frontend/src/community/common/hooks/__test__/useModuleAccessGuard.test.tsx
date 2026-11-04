import { renderHook } from "@testing-library/react";
import { NextRequest } from "next/server";
import { act } from "react";

import { ACCESS_TOKEN_COOKIE_NAME } from "~community/auth/constants/authConstants";
import ROUTES from "~community/common/constants/routes";
import { useCommonStore } from "~community/common/stores/commonStore";

import { proxy } from "../../../../../proxy";
import useModuleAccessGuard, { isModuleAccessDenied } from "../useModuleAccessGuard";

const replace = jest.fn();
let currentPath = "/crm/deals";

jest.mock("next/router", () => ({
  useRouter: () => ({
    asPath: currentPath,
    replace
  })
}));

const ONE_HOUR_IN_SECONDS = 60 * 60;

const createToken = (roles: string[]): string => {
  const claims = {
    sub: "downgraded.user@skapp.com",
    userId: 42,
    roles,
    exp: Math.floor(Date.now() / 1000) + ONE_HOUR_IN_SECONDS
  };

  const payload = Buffer.from(JSON.stringify(claims)).toString("base64url");

  return `header.${payload}.signature`;
};

const BASE_ROLES = ["ROLE_PEOPLE_EMPLOYEE"];

const CRM_ROLES = [
  ...BASE_ROLES,
  "ROLE_CRM_ADMIN",
  "ROLE_CRM_SALES_MANAGER",
  "ROLE_CRM_SALES_REPRESENTATIVE"
];

const ESIGN_ROLES = [
  ...BASE_ROLES,
  "ROLE_ESIGN_ADMIN",
  "ROLE_ESIGN_SENDER",
  "ROLE_ESIGN_EMPLOYEE"
];

const proxyBlocks = async (path: string, roles: string[]): Promise<boolean> => {
  const request = new NextRequest(new URL(`http://localhost${path}`));

  request.cookies.set(ACCESS_TOKEN_COOKIE_NAME, createToken(roles));

  const response = await proxy(request);

  return response.headers.get("location") !== null;
};

beforeEach(() => {
  jest.clearAllMocks();
  currentPath = "/crm/deals";
  useCommonStore.setState({ accessToken: null });
});

describe("redirecting a user whose roles changed under them", () => {
  test("a CRM user staying on a CRM page is left alone", () => {
    useCommonStore.setState({ accessToken: createToken(CRM_ROLES) });

    renderHook(() => useModuleAccessGuard());

    expect(replace).not.toHaveBeenCalled();
  });

  test("losing CRM access while on a CRM page redirects to the dashboard", () => {
    useCommonStore.setState({ accessToken: createToken(CRM_ROLES) });

    renderHook(() => useModuleAccessGuard());

    expect(replace).not.toHaveBeenCalled();

    act(() => {
      useCommonStore.setState({ accessToken: createToken(BASE_ROLES) });
    });

    expect(replace).toHaveBeenCalledWith(ROUTES.DASHBOARD.BASE);
  });

  test("losing e-sign access while on an e-sign page redirects too", () => {
    currentPath = "/sign/inbox";
    useCommonStore.setState({ accessToken: createToken(ESIGN_ROLES) });

    renderHook(() => useModuleAccessGuard());

    act(() => {
      useCommonStore.setState({ accessToken: createToken(BASE_ROLES) });
    });

    expect(replace).toHaveBeenCalledWith(ROUTES.DASHBOARD.BASE);
  });

  test("a user on an unrelated page is never redirected", () => {
    currentPath = "/people/directory";
    useCommonStore.setState({ accessToken: createToken(CRM_ROLES) });

    renderHook(() => useModuleAccessGuard());

    act(() => {
      useCommonStore.setState({ accessToken: createToken(BASE_ROLES) });
    });

    expect(replace).not.toHaveBeenCalled();
  });

  test("no token means no redirect", () => {
    renderHook(() => useModuleAccessGuard());

    expect(replace).not.toHaveBeenCalled();
  });

  test("a token with no roles means no redirect", () => {
    useCommonStore.setState({ accessToken: createToken([]) });

    renderHook(() => useModuleAccessGuard());

    expect(replace).not.toHaveBeenCalled();
  });
});

describe("the guard agrees with the proxy", () => {
  const cases: { path: string; roles: string[] }[] = [
    { path: "/crm/deals", roles: CRM_ROLES },
    { path: "/crm/deals", roles: BASE_ROLES },
    { path: "/crm/companies", roles: BASE_ROLES },
    { path: "/sign/inbox", roles: ESIGN_ROLES },
    { path: "/sign/inbox", roles: BASE_ROLES }
  ];

  test.each(cases)(
    "$path with those roles gets the same verdict from both",
    async ({ path, roles }) => {
      expect(isModuleAccessDenied(path, roles)).toBe(
        await proxyBlocks(path, roles)
      );
    }
  );
});

describe("downgrades that keep access to the page", () => {
  const CRM_REP_ONLY = [...BASE_ROLES, "ROLE_CRM_SALES_REPRESENTATIVE"];

  test("a demotion that keeps module access does not redirect", () => {
    useCommonStore.setState({ accessToken: createToken(CRM_ROLES) });

    renderHook(() => useModuleAccessGuard());

    act(() => {
      useCommonStore.setState({ accessToken: createToken(CRM_REP_ONLY) });
    });

    expect(replace).not.toHaveBeenCalled();
  });

  test("and the proxy would not block that page either", async () => {
    expect(await proxyBlocks("/crm/deals", CRM_REP_ONLY)).toBe(false);
  });

  test("a demotion within e-sign is NOT caught by the guard", () => {
    expect(
      isModuleAccessDenied("/sign/contacts", [
        ...BASE_ROLES,
        "ROLE_ESIGN_EMPLOYEE"
      ])
    ).toBe(false);
  });

  test("even though the proxy blocks that page on a navigation", async () => {
    expect(
      await proxyBlocks("/sign/contacts", [
        ...BASE_ROLES,
        "ROLE_ESIGN_EMPLOYEE"
      ])
    ).toBe(true);
  });
});

describe("paths that only look like e-sign routes", () => {
  const withoutEsign = (path: string): boolean => {
    jest.clearAllMocks();
    currentPath = path;
    useCommonStore.setState({ accessToken: createToken(BASE_ROLES) });

    renderHook(() => useModuleAccessGuard());

    return replace.mock.calls.length > 0;
  };

  test("/signin is not an e-sign route", () => {
    expect(withoutEsign("/signin")).toBe(false);
  });

  test("/signup is not an e-sign route", () => {
    expect(withoutEsign("/signup")).toBe(false);
  });

  test("/sign itself still is", () => {
    expect(withoutEsign("/sign")).toBe(true);
  });

  test("/sign/inbox still is", () => {
    expect(withoutEsign("/sign/inbox")).toBe(true);
  });
});

describe("the external signing link stays open", () => {
  // The proxy exempts this path via isUnguardedPath and does not route the
  // verification sub-steps through its matcher at all
  const openPaths: string[] = [
    "/sign/document/access",
    "/sign/document/access/mfa-verify",
    "/sign/document/access/bankid-verify"
  ];

  test.each(openPaths)("%s is never gated by the guard", (path: string) => {
    expect(isModuleAccessDenied(path, BASE_ROLES)).toBe(false);
  });

  test("a signed-in user without e-sign is not thrown off the link", () => {
    jest.clearAllMocks();
    currentPath = "/sign/document/access";
    useCommonStore.setState({ accessToken: createToken(BASE_ROLES) });

    renderHook(() => useModuleAccessGuard());

    expect(replace).not.toHaveBeenCalled();
  });

  test("the proxy agrees the link is open", async () => {
    expect(await proxyBlocks("/sign/document/access", BASE_ROLES)).toBe(false);
  });
});
