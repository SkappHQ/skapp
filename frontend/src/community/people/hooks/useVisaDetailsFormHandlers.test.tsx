import { act, renderHook } from "@testing-library/react";

import { usePeopleStore } from "~community/people/store/store";

import useVisaDetailsFormHandlers from "./useVisaDetailsFormHandlers";

jest.mock("~community/people/store/store", () => ({
  usePeopleStore: jest.fn()
}));

jest.mock("~community/people/hooks/useGetCountryList", () =>
  jest.fn(() => [
    { label: "United States", value: "US" },
    { label: "Canada", value: "CA" }
  ])
);

describe("useVisaDetailsFormHandlers", () => {
  const mockSetEmploymentDetails = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (usePeopleStore as jest.Mock).mockReturnValue({
      employee: {
        employment: {
          visaDetails: [
            {
              visaType: "Work Visa",
              issuingCountry: "US",
              issuedDate: "2023-01-01",
              expiryDate: "2025-01-01",
              visaId: 1
            }
          ]
        }
      },
      setEmploymentDetails: mockSetEmploymentDetails
    });
  });

  it("should initialize with correct default values", () => {
    const { result } = renderHook(() => useVisaDetailsFormHandlers());

    expect(result.current.values).toEqual({
      visaType: "",
      issuingCountry: "",
      issuedDate: "",
      expiryDate: ""
    });
    expect(result.current.rowEdited).toBe(-1);
  });

  it("should handle input changes correctly", async () => {
    const { result } = renderHook(() => useVisaDetailsFormHandlers());

    await act(async () => {
      await result.current.handleInput({
        target: { name: "visaType", value: "Work Visa" }
      } as any);
    });

    expect(result.current.values.visaType).toBe("Work Visa");
  });

  it("should handle country selection correctly", async () => {
    const { result } = renderHook(() => useVisaDetailsFormHandlers());

    await act(async () => {
      await result.current.handleCountrySelect(
        {},
        { label: "Canada", value: "CA" }
      );
    });

    expect(result.current.values.issuingCountry).toBe("CA");
  });

  it("should handle date changes correctly", async () => {
    const { result } = renderHook(() => useVisaDetailsFormHandlers());

    await act(async () => {
      await result.current.dateOnChange("issuedDate", "2023-01-01");
    });

    expect(result.current.values.issuedDate).toBe("2023-01-01");
  });

  it("should handle editing an existing visa", async () => {
    const { result } = renderHook(() => useVisaDetailsFormHandlers());

    act(() => {
      result.current.handleEdit(0);
    });

    expect(result.current.values).toEqual({
      visaType: "Work Visa",
      issuingCountry: "US",
      issuedDate: "2023-01-01",
      expiryDate: "2025-01-01"
    });

    await act(async () => {
      await result.current.handleInput({
        target: { name: "visaType", value: "Updated Visa" }
      } as any);
      await result.current.handleSubmit();
    });

    expect(mockSetEmploymentDetails).toHaveBeenCalledWith({
      visaDetails: [
        {
          visaType: "Updated Visa",
          issuingCountry: "US",
          issuedDate: "2023-01-01",
          expiryDate: "2025-01-01",
          visaId: 1
        }
      ]
    });
  });

  it("should handle deleting a visa", () => {
    const { result } = renderHook(() => useVisaDetailsFormHandlers());

    act(() => {
      result.current.handleDelete(0);
    });

    expect(mockSetEmploymentDetails).toHaveBeenCalledWith({
      visaDetails: []
    });
  });

  it("should format table data correctly", () => {
    const { result } = renderHook(() => useVisaDetailsFormHandlers());

    const formattedData = result.current.formatTableData([
      {
        visaType: "Work Visa",
        issuingCountry: "US",
        issuedDate: "2023-01-01T00:00:00Z",
        expiryDate: "2025-01-01T00:00:00Z"
      }
    ]);

    expect(formattedData).toEqual([
      {
        visaType: "Work Visa",
        issuingCountry: "US",
        issuedDate: "2023-01-01",
        expirationDate: "2025-01-01"
      }
    ]);
  });
});
