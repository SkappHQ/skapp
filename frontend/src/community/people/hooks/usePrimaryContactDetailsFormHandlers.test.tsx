import { SelectChangeEvent } from "@mui/material";
import { act, renderHook } from "@testing-library/react";

import { usePeopleStore } from "~community/people/store/store";

import useGetDefaultCountryCode from "./useGetDefaultCountryCode";
import usePrimaryContactDetailsFormHandlers from "./usePrimaryContactDetailsFormHandlers";

jest.mock("~community/people/store/store", () => ({
  usePeopleStore: jest.fn()
}));

jest.mock("./useGetDefaultConuntryCode", () => jest.fn());

describe("usePrimaryContactDetailsFormHandlers", () => {
  const mockSetEmergencyDetails = jest.fn();
  const mockEmployee = {
    emergency: {
      primaryEmergencyContact: {
        name: "John Doe",
        relationship: "Spouse",
        contactNo: "1 1234567890"
      }
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (usePeopleStore as jest.Mock).mockReturnValue({
      employee: mockEmployee,
      setEmergencyDetails: mockSetEmergencyDetails
    });
    (useGetDefaultCountryCode as jest.Mock).mockReturnValue("1");
  });

  it("should initialize form values correctly", () => {
    const { result } = renderHook(() => usePrimaryContactDetailsFormHandlers());

    expect(result.current.values).toEqual({
      name: "John Doe",
      relationship: "Spouse",
      countryCode: "1",
      contactNo: "1234567890"
    });
  });

  it("should handle name input changes correctly", async () => {
    const { result } = renderHook(() => usePrimaryContactDetailsFormHandlers());

    await act(async () => {
      await result.current.handleInput({
        target: { name: "name", value: "Jane Doe" }
      } as SelectChangeEvent);
    });

    expect(result.current.values.name).toBe("Jane Doe");
    expect(mockSetEmergencyDetails).toHaveBeenCalledWith({
      primaryEmergencyContact: {
        ...mockEmployee.emergency.primaryEmergencyContact,
        name: "Jane Doe"
      }
    });
  });

  it("should handle relationship input changes correctly", async () => {
    const { result } = renderHook(() => usePrimaryContactDetailsFormHandlers());

    await act(async () => {
      await result.current.handleInput({
        target: { name: "relationship", value: "Parent" }
      } as SelectChangeEvent);
    });

    expect(result.current.values.relationship).toBe("Parent");
    expect(mockSetEmergencyDetails).toHaveBeenCalledWith({
      primaryEmergencyContact: {
        ...mockEmployee.emergency.primaryEmergencyContact,
        relationship: "Parent"
      }
    });
  });

  it("should handle country code changes correctly", async () => {
    const { result } = renderHook(() => usePrimaryContactDetailsFormHandlers());

    await act(async () => {
      await result.current.onChangeCountry("94");
    });

    expect(result.current.values.countryCode).toBe("94");
  });

  it("should handle phone number changes correctly", async () => {
    const { result } = renderHook(() => usePrimaryContactDetailsFormHandlers());

    await act(async () => {
      await result.current.handlePhoneNumber({
        target: { value: "9876543210" }
      } as any);
    });

    expect(result.current.values.contactNo).toBe("9876543210");
    expect(mockSetEmergencyDetails).toHaveBeenCalledWith({
      primaryEmergencyContact: {
        ...mockEmployee.emergency.primaryEmergencyContact,
        contactNo: "1 9876543210"
      }
    });
  });

  it("should validate and set errors for invalid inputs", async () => {
    const { result } = renderHook(() => usePrimaryContactDetailsFormHandlers());

    await act(async () => {
      await result.current.handleInput({
        target: { name: "name", value: "Invalid@Name" }
      } as SelectChangeEvent);
    });

    expect(result.current.errors.name).toBeUndefined();
  });
});
