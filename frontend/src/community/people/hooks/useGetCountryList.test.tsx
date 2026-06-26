import { renderHook } from "@testing-library/react";

import { countryCodeList } from "../data/countryCodes";
import useGetCountryList from "./useGetCountryList";

jest.mock("../data/countryCodes", () => ({
  countryCodeList: [
    { name: "United States", code: "US" },
    { name: "Canada", code: "CA" },
    { name: "United Kingdom", code: "UK" }
  ]
}));

describe("useGetCountryList", () => {
  it("should return a list of countries with label and value", () => {
    const { result } = renderHook(() => useGetCountryList());

    expect(result.current).toEqual([
      { label: "United States", value: "United States" },
      { label: "Canada", value: "Canada" },
      { label: "United Kingdom", value: "United Kingdom" }
    ]);
  });

  it("should return an empty list if countryCodeList is empty", () => {
    jest.mocked(countryCodeList).length = 0;

    const { result } = renderHook(() => useGetCountryList());

    expect(result.current).toEqual([]);
  });
});
