import { renderHook } from "@testing-library/react";

import { useCommonStore } from "~community/common/stores/commonStore";

import useGetDefaultCountryCode from "./useGetDefaultCountryCode";

jest.mock("~community/common/stores/commonStore", () => ({
  useCommonStore: jest.fn()
}));

jest.mock("../data/countryCodes", () => ({
  countryCodeList: [
    { name: "United States", code: "1" },
    { name: "Canada", code: "1" },
    { name: "Sri Lanka", code: "94" }
  ]
}));

describe("useGetDefaultConuntryCode", () => {
  it("should return the correct country code when a matching country is found", () => {
    (useCommonStore as jest.Mock).mockReturnValue({ country: "Sri Lanka" });

    const { result } = renderHook(() => useGetDefaultCountryCode());

    expect(result.current).toBe("94");
  });

  it("should return the default country code '94' when no matching country is found", () => {
    (useCommonStore as jest.Mock).mockReturnValue({
      country: "Unknown Country"
    });

    const { result } = renderHook(() => useGetDefaultCountryCode());

    expect(result.current).toBe("94");
  });

  it("should return the default country code '94' when no country is provided", () => {
    (useCommonStore as jest.Mock).mockReturnValue({ country: null });

    const { result } = renderHook(() => useGetDefaultCountryCode());

    expect(result.current).toBe("94");
  });

  it("should handle case-insensitive country name matching", () => {
    (useCommonStore as jest.Mock).mockReturnValue({ country: "sri lanka" });

    const { result } = renderHook(() => useGetDefaultCountryCode());

    expect(result.current).toBe("94");
  });
});
