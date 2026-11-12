import { policyLeaveEndPoints } from "~community/leave/api/utils/ApiEndpoints";
import { policyLeaveQueryKeys } from "~community/leave/api/utils/QueryKeys";
import { PolicyLeaveUtilizationSourceParams } from "~community/leave/types/PolicyLeaveTypes";

import { getPolicyLeaveUtilizationSource } from "./policyLeaveUtils";

const buildSourceParams = (
  overrides: Partial<PolicyLeaveUtilizationSourceParams> = {}
): PolicyLeaveUtilizationSourceParams => ({
  isProTier: true,
  isLeavePoliciesEnabled: false,
  isLeavePolicyConfigLoading: false,
  ...overrides
});

describe("getPolicyLeaveUtilizationSource", () => {
  it("uses the policy endpoint and disables the legacy one when policies are enabled", () => {
    expect(
      getPolicyLeaveUtilizationSource(
        buildSourceParams({ isLeavePoliciesEnabled: true })
      )
    ).toEqual({ isLegacyEnabled: false, isPolicyEnabled: true });
  });

  it("uses the legacy endpoint when policies are disabled", () => {
    expect(getPolicyLeaveUtilizationSource(buildSourceParams())).toEqual({
      isLegacyEnabled: true,
      isPolicyEnabled: false
    });
  });

  it("calls neither endpoint while the policy config is loading", () => {
    expect(
      getPolicyLeaveUtilizationSource(
        buildSourceParams({ isLeavePolicyConfigLoading: true })
      )
    ).toEqual({ isLegacyEnabled: false, isPolicyEnabled: false });
  });

  it("calls neither endpoint below the pro tier", () => {
    expect(
      getPolicyLeaveUtilizationSource(
        buildSourceParams({ isProTier: false, isLeavePoliciesEnabled: true })
      )
    ).toEqual({ isLegacyEnabled: false, isPolicyEnabled: false });
    expect(
      getPolicyLeaveUtilizationSource(buildSourceParams({ isProTier: false }))
    ).toEqual({ isLegacyEnabled: false, isPolicyEnabled: false });
  });
});

describe("policy employee leave utilization query", () => {
  it("builds the employee leave utilization endpoint", () => {
    expect(policyLeaveEndPoints.GET_EMPLOYEE_LEAVE_UTILIZATION(12)).toMatch(
      /\/policy-leave\/employees\/12\/leave-utilization$/
    );
  });

  it("keys the query under the policy leave key so leave reviews refresh it", () => {
    const queryKey = policyLeaveQueryKeys.EMPLOYEE_LEAVE_UTILIZATION(12);

    expect(queryKey.slice(0, policyLeaveQueryKeys.ALL.length)).toEqual(
      policyLeaveQueryKeys.ALL
    );
    expect(
      queryKey.slice(
        0,
        policyLeaveQueryKeys.ALL_EMPLOYEE_LEAVE_UTILIZATION().length
      )
    ).toEqual(policyLeaveQueryKeys.ALL_EMPLOYEE_LEAVE_UTILIZATION());
    expect(queryKey).toContain(12);
  });
});
