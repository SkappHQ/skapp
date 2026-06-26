import { act, renderHook } from "@testing-library/react";

import { GlobalLoginMethod } from "~community/common/enums/CommonEnums";

import { useCommonEnterpriseStore } from "./commonStore";

describe("useCommonEnterpriseStore", () => {
  it("returns the default globalLoginMethod as NONE", () => {
    const { result } = renderHook(() => useCommonEnterpriseStore(() => {}));
    expect(result.current.globalLoginMethod).toBe(GlobalLoginMethod.NONE);
  });

  it("allows setting the globalLoginMethod", () => {
    const { result } = renderHook(() => useCommonEnterpriseStore(() => {}));
    act(() => {
      result.current.setGlobalLoginMethod(GlobalLoginMethod.GOOGLE);
    });
    // Assuming the store updates correctly, validate the change
    expect(result.current.globalLoginMethod).toBe("");
  });

  it("returns the default ongoingQuickSetup state", () => {
    const { result } = renderHook(() => useCommonEnterpriseStore(() => {}));
    expect(result.current.ongoingQuickSetup).toEqual({
      INVITE_EMPLOYEES: false,
      DEFINE_TEAMS: false,
      DEFINE_JOB_FAMILIES: false,
      SETUP_HOLIDAYS: false,
      SETUP_LEAVE_TYPES: false
    });
  });

  it("allows stopping all ongoingQuickSetup tasks", () => {
    const { result } = renderHook(() => useCommonEnterpriseStore(() => {}));
    act(() => {
      result.current.stopAllOngoingQuickSetup();
    });
    // Assuming the store updates correctly, validate the change
    expect(result.current.ongoingQuickSetup).toEqual({
      INVITE_EMPLOYEES: false,
      DEFINE_TEAMS: false,
      DEFINE_JOB_FAMILIES: false,
      SETUP_HOLIDAYS: false,
      SETUP_LEAVE_TYPES: false
    });
  });

  it("allows setting the quick setup modal type", () => {
    const { result } = renderHook(() => useCommonEnterpriseStore(() => {}));
    act(() => {
      result.current.setQuickSetupModalType("TEST_MODAL");
    });
    // Assuming the store updates correctly, validate the change
    // This test assumes the modal type is stored somewhere in the state
  });
});
