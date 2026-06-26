import { renderHook } from "@testing-library/react";

import useProductTour from "./useProductTour";

describe("useProductTour", () => {
  it("returns an object with a driverObj property", () => {
    const { result } = renderHook(() => useProductTour());
    expect(result.current).toHaveProperty("driverObj");
  });

  it("driverObj contains a destroy function", () => {
    const { result } = renderHook(() => useProductTour());
    expect(typeof result.current.driverObj.destroy).toBe("function");
  });

  it("calls the destroy function without errors", () => {
    const { result } = renderHook(() => useProductTour());
    expect(() => result.current.driverObj.destroy()).not.toThrow();
  });
});
