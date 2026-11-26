import { renderHook } from "@testing-library/react";

import useSessionData from "~community/common/hooks/useSessionData";

import useCanAssignLeavePolicies from "./useCanAssignLeavePolicies";

jest.mock("~community/common/hooks/useSessionData", () => jest.fn());

type SessionRoles = {
  isSuperAdmin?: boolean;
  isLeaveAdmin?: boolean;
  isPeopleAdmin?: boolean;
};

const roleCases: [string, SessionRoles, boolean][] = [
  ["super admin", { isSuperAdmin: true }, true],
  ["leave admin", { isLeaveAdmin: true }, true],
  ["people admin", { isPeopleAdmin: true }, true],
  ["employee", {}, false]
];

describe("useCanAssignLeavePolicies", () => {
  it.each(roleCases)(
    "returns the assign permission for a %s",
    (_role, sessionRoles, expected) => {
      (useSessionData as jest.Mock).mockReturnValue(sessionRoles);

      const { result } = renderHook(() => useCanAssignLeavePolicies());

      expect(result.current).toBe(expected);
    }
  );
});
