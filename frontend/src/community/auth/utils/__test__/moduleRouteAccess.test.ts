import { NextRequest } from "next/server";

import { ACCESS_TOKEN_COOKIE_NAME } from "~community/auth/constants/authConstants";

import { proxy } from "../../../../../proxy";

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

const requestPage = async (
  path: string,
  roles: string[]
): Promise<{ status: number; location: string | null }> => {
  const request = new NextRequest(new URL(`http://localhost${path}`));

  request.cookies.set(ACCESS_TOKEN_COOKIE_NAME, createToken(roles));

  const response = await proxy(request);

  return {
    status: response.status,
    location: response.headers.get("location")
  };
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

const isAllowed = (result: { location: string | null }): boolean =>
  result.location === null;

describe("CRM route access decided from the token", () => {
  test("a token carrying CRM roles is let in", async () => {
    expect(isAllowed(await requestPage("/crm/deals", CRM_ROLES))).toBe(true);
  });

  test("a token with the CRM roles removed is blocked", async () => {
    const result = await requestPage("/crm/deals", BASE_ROLES);

    expect(result.location).toContain("/unauthorized");
  });

  test("adding ROLE_CRM_NONE to the token changes nothing", async () => {
    const withoutNone = await requestPage("/crm/deals", BASE_ROLES);
    const withNone = await requestPage("/crm/deals", [
      ...BASE_ROLES,
      "ROLE_CRM_NONE"
    ]);

    expect(withNone.location).toBe(withoutNone.location);
  });

  test("a stale token still carrying CRM roles is let in after the downgrade", async () => {
    expect(isAllowed(await requestPage("/crm/deals", CRM_ROLES))).toBe(true);
    expect(isAllowed(await requestPage("/crm/deals", BASE_ROLES))).toBe(false);
  });
});

describe("e-sign route access decided from the token", () => {
  test("a token carrying e-sign roles is let in", async () => {
    expect(isAllowed(await requestPage("/sign/inbox", ESIGN_ROLES))).toBe(true);
  });

  test("a token with the e-sign roles removed is blocked", async () => {
    const result = await requestPage("/sign/inbox", BASE_ROLES);

    expect(result.location).toContain("/unauthorized");
  });

  test("a stale token still carrying e-sign roles is let in after the downgrade", async () => {
    expect(isAllowed(await requestPage("/sign/inbox", ESIGN_ROLES))).toBe(true);
    expect(isAllowed(await requestPage("/sign/inbox", BASE_ROLES))).toBe(false);
  });
});

describe("an e-sign downgrade that the product actually offers", () => {
  const ESIGN_EMPLOYEE_ONLY = [...BASE_ROLES, "ROLE_ESIGN_EMPLOYEE"];

  test("an e-sign admin can open the contacts page", async () => {
    expect(isAllowed(await requestPage("/sign/contacts", ESIGN_ROLES))).toBe(
      true
    );
  });

  test("after a downgrade to e-sign employee the contacts page is blocked", async () => {
    const result = await requestPage("/sign/contacts", ESIGN_EMPLOYEE_ONLY);

    expect(result.location).toContain("/unauthorized");
  });

  test("but the pre-downgrade token still opens it", async () => {
    expect(isAllowed(await requestPage("/sign/contacts", ESIGN_ROLES))).toBe(
      true
    );
  });
});
