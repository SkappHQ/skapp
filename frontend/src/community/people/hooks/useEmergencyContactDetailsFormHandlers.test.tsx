import { SelectChangeEvent } from "@mui/material";
import { act, renderHook } from "@testing-library/react";

import { usePeopleStore } from "~community/people/store/store";

import useEmergencyContactDetailsFormHandlers from "./useEmergencyContactDetailsFormHandlers";
import useGetDefaultCountryCode from "./useGetDefaultCountryCode";

jest.mock("~community/people/store/store", () => ({
  usePeopleStore: jest.fn()
}));

jest.mock("./useGetDefaultCountryCode", () => jest.fn());

describe("useEmergencyContactDetailsFormHandlers", () => {
  const mockSetEmergencyDetails = jest.fn();
  const mockEmployee = {
    emergency: {
      primaryEmergencyContact: {
        name: "John Doe",
        relationship: "Spouse",
        contactNo: "1 1234567890"
      },
      secondaryEmergencyContact: {
        name: "Jane Doe",
        relationship: "Sibling",
        contactNo: "1 9876543210"
      }
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (usePeopleStore as unknown as jest.Mock).mockReturnValue({
      employee: mockEmployee,
      setEmergencyDetails: mockSetEmergencyDetails
    });
    (useGetDefaultCountryCode as jest.Mock).mockReturnValue("1");
  });

  describe("primaryEmergencyContact", () => {
    it("should initialize form values correctly for primary contact", () => {
      const { result } = renderHook(() =>
        useEmergencyContactDetailsFormHandlers("primaryEmergencyContact")
      );

      expect(result.current.values).toEqual({
        name: "John Doe",
        relationship: "Spouse",
        countryCode: "1",
        contactNo: "1234567890"
      });
    });

    it("should handle name input changes correctly for primary contact", async () => {
      const { result } = renderHook(() =>
        useEmergencyContactDetailsFormHandlers("primaryEmergencyContact")
      );

      await act(async () => {
        await result.current.handleInput({
          target: { name: "name", value: "Jane Smith" }
        } as SelectChangeEvent);
      });

      expect(result.current.values.name).toBe("Jane Smith");
      expect(mockSetEmergencyDetails).toHaveBeenCalledWith({
        primaryEmergencyContact: {
          ...mockEmployee.emergency.primaryEmergencyContact,
          name: "Jane Smith"
        }
      });
    });

    it("should handle relationship input changes correctly for primary contact", async () => {
      const { result } = renderHook(() =>
        useEmergencyContactDetailsFormHandlers("primaryEmergencyContact")
      );

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

    it("should handle phone number changes correctly for primary contact", async () => {
      const { result } = renderHook(() =>
        useEmergencyContactDetailsFormHandlers("primaryEmergencyContact")
      );

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
  });

  describe("secondaryEmergencyContact", () => {
    it("should initialize form values correctly for secondary contact", () => {
      const { result } = renderHook(() =>
        useEmergencyContactDetailsFormHandlers("secondaryEmergencyContact")
      );

      expect(result.current.values).toEqual({
        name: "Jane Doe",
        relationship: "Sibling",
        countryCode: "1",
        contactNo: "9876543210"
      });
    });

    it("should handle name input changes correctly for secondary contact", async () => {
      const { result } = renderHook(() =>
        useEmergencyContactDetailsFormHandlers("secondaryEmergencyContact")
      );

      await act(async () => {
        await result.current.handleInput({
          target: { name: "name", value: "John Smith" }
        } as SelectChangeEvent);
      });

      expect(result.current.values.name).toBe("John Smith");
      expect(mockSetEmergencyDetails).toHaveBeenCalledWith({
        secondaryEmergencyContact: {
          ...mockEmployee.emergency.secondaryEmergencyContact,
          name: "John Smith"
        }
      });
    });

    it("should handle relationship input changes correctly for secondary contact", async () => {
      const { result } = renderHook(() =>
        useEmergencyContactDetailsFormHandlers("secondaryEmergencyContact")
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

    it("should handle phone number changes correctly for secondary contact", async () => {
      const { result } = renderHook(() =>
        useEmergencyContactDetailsFormHandlers("secondaryEmergencyContact")
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
  });

  describe("common functionality", () => {
    it("should handle country code changes correctly", async () => {
      const { result } = renderHook(() =>
        useEmergencyContactDetailsFormHandlers("primaryEmergencyContact")
      );

      await act(async () => {
        await result.current.onChangeCountry("94");
      });

      expect(result.current.values.countryCode).toBe("94");
    });

    it("should initialize with default country code when contact has no phone number", () => {
      const mockEmployeeWithoutPhone = {
        emergency: {
          primaryEmergencyContact: {
            name: "John Doe",
            relationship: "Spouse"
          }
        }
      };

      (usePeopleStore as unknown as jest.Mock).mockReturnValue({
        employee: mockEmployeeWithoutPhone,
        setEmergencyDetails: mockSetEmergencyDetails
      });

      const { result } = renderHook(() =>
        useEmergencyContactDetailsFormHandlers("primaryEmergencyContact")
      );

      expect(result.current.values).toEqual({
        name: "John Doe",
        relationship: "Spouse",
        countryCode: "1",
        contactNo: ""
      });
    });

    it("should handle empty employee emergency data", () => {
      const mockEmployeeEmpty = { emergency: {} };

      (usePeopleStore as unknown as jest.Mock).mockReturnValue({
        employee: mockEmployeeEmpty,
        setEmergencyDetails: mockSetEmergencyDetails
      });

      const { result } = renderHook(() =>
        useEmergencyContactDetailsFormHandlers("primaryEmergencyContact")
      );

      expect(result.current.values).toEqual({
        countryCode: "1",
        contactNo: ""
      });
    });
  });
});
