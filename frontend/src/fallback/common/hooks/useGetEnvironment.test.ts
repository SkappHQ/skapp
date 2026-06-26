import { renderHook } from "@testing-library/react";

import { useGetEnvironment } from "./useGetEnvironment";

describe("useGetEnvironment", () => {
  it("returns the correct environment variable", () => {
    process.env.NEXT_PUBLIC_MODE = "development";
    const { result } = renderHook(() => useGetEnvironment());
    expect(result.current).toBe("development");
  });

  it("returns undefined if NEXT_PUBLIC_MODE is not set", () => {
    delete process.env.NEXT_PUBLIC_MODE;
    const { result } = renderHook(() => useGetEnvironment());
    expect(result.current).toBeUndefined();
  });
});
