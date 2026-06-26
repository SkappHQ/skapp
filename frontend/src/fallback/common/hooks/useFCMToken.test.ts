import { act, renderHook } from "@testing-library/react";

import useFcmToken from "./useFCMToken";

describe("useFcmToken", () => {
  it("returns the initial token as null", () => {
    const { result } = renderHook(() => useFcmToken());
    expect(result.current.token).toBeNull();
  });

  it("provides a resetUnreadCount function", () => {
    const { result } = renderHook(() => useFcmToken());
    expect(typeof result.current.resetUnreadCount).toBe("function");
  });

  it("calls resetUnreadCount without errors", () => {
    const { result } = renderHook(() => useFcmToken());
    act(() => {
      result.current.resetUnreadCount();
    });
    // No errors should occur
  });
});
