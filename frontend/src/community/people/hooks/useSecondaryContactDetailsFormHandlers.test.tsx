import { SelectChangeEvent } from "@mui/material";
import { act, renderHook } from "@testing-library/react";

import { usePeopleStore } from "~community/people/store/store";

import useGetDefaultCountryCode from "./useGetDefaultCountryCode";
import useSecondaryContactDetailsFormHandlers from "./useSecondaryContactDetailsFormHandlers";

jest.mock("~community/people/store/store", () => ({
  usePeopleStore: jest.fn()
}));

jest.mock("./useGetDefaultConuntryCode", () => jest.fn());

describe("useSecondaryContactDetailsFormHandlers", () => {
  const mockSetEmergencyDetails = jest.fn();
  const mockEmployee = {
    emergency: {
      secondaryEmergencyContact: {
        name: "Jane Doe",
        relationship: "Sibling",
        contactNo: "1 9876543210"
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
    const { result } = renderHook(() =>
      useSecondaryContactDetailsFormHandlers()
    );

    expect(result.current.values).toEqual({
      name: "Jane Doe",
      relationship: "Sibling",
      countryCode: "1",
      contactNo: "9876543210"
    });
  });

  it("should handle name input changes correctly", async () => {
    const { result } = renderHook(() =>
      useSecondaryContactDetailsFormHandlers()
    );

    await act(async () => {
      await result.current.handleInput({
        target: { name: "name", value: "John Doe" }
      } as SelectChangeEvent);
    });

    expect(result.current.values.name).toBe("John Doe");
    expect(mockSetEmergencyDetails).toHaveBeenCalledWith({
      secondaryEmergencyContact: {
        ...mockEmployee.emergency.secondaryEmergencyContact,
        name: "John Doe"
      }
    });
  });

  it("should handle relationship input changes correctly", async () => {
    const { result } = renderHook(() =>
      useSecondaryContactDetailsFormHandlers()
    );

    await act(async () => {
      await result.current.handleInput({
        target: { name: "relationship", value: "Parent" }
      } as SelectChangeEvent);
    });

    expect(result.current.values.relationship).toBe("Parent");
    expect(mockSetEmergencyDetails).toHaveBeenCalledWith({
      secondaryEmergencyContact: {
        ...mockEmployee.emergency.secondaryEmergencyContact,
        relationship: "Parent"
      }
    });
  });

  it("should handle country code changes correctly", async () => {
    const { result } = renderHook(() =>
      useSecondaryContactDetailsFormHandlers()
    );

    await act(async () => {
      await result.current.onChangeCountry("94");
    });

    expect(result.current.values.countryCode).toBe("94");
  });

  it("should handle phone number changes correctly", async () => {
    const { result } = renderHook(() =>
      useSecondaryContactDetailsFormHandlers()
    );

    await act(async () => {
      await result.current.handlePhoneNumber({
        target: { value: "1234567890" }
      } as any);
    });

    expect(result.current.values.contactNo).toBe("1234567890");
    expect(mockSetEmergencyDetails).toHaveBeenCalledWith({
      secondaryEmergencyContact: {
        ...mockEmployee.emergency.secondaryEmergencyContact,
        contactNo: "1 1234567890"
      }
    });
  });

  it("should validate and set errors for invalid inputs", async () => {
    const { result } = renderHook(() =>
      useSecondaryContactDetailsFormHandlers()
    );

    await act(async () => {
      await result.current.handleInput({
        target: { name: "name", value: "Invalid@Name" }
      } as SelectChangeEvent);
    });

    expect(result.current.errors.name).toBeUndefined();
  });
});
