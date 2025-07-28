import { SelectChangeEvent } from "@mui/material";
import { act, renderHook } from "@testing-library/react";

import { usePeopleStore } from "~community/people/store/store";

import useEmergencyContactDetailsFormHandlers from "./useEmergencyContactDetailsFormHandlers";
import useGetDefaultCountryCode from "./useGetDefaultCountryCode";

jest.mock("~community/people/store/store", () => ({
  usePeopleStore: jest.fn()
}));

jest.mock("./useGetDefaultCountryCode", () => jest.fn());

type ContactType = "primaryEmergencyContact" | "secondaryEmergencyContact";

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

  const contactTestData = {
    primaryEmergencyContact: {
      expectedValues: {
        name: "John Doe",
        relationship: "Spouse",
        countryCode: "1",
        contactNo: "1234567890"
      },
      testInputs: {
        newName: "Jane Smith",
        newRelationship: "Parent",
        newContactNo: "9876543210",
        expectedStoredContactNo: "1 9876543210"
      }
    },
    secondaryEmergencyContact: {
      expectedValues: {
        name: "Jane Doe",
        relationship: "Sibling",
        countryCode: "1",
        contactNo: "9876543210"
      },
      testInputs: {
        newName: "John Smith",
        newRelationship: "Parent",
        newContactNo: "1234567890",
        expectedStoredContactNo: "1 1234567890"
      }
    }
  };

  const renderHookWithType = (contactType: ContactType) => {
    return renderHook(() =>
      useEmergencyContactDetailsFormHandlers(contactType)
    );
  };

  const simulateInputChange = async (
    result: any,
    field: string,
    value: string
  ) => {
    await act(async () => {
      await result.current.handleInput({
        target: { name: field, value }
      } as SelectChangeEvent);
    });
  };

  const simulatePhoneNumberChange = async (result: any, value: string) => {
    await act(async () => {
      await result.current.handlePhoneNumber({
        target: { value }
      } as any);
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (usePeopleStore as unknown as jest.Mock).mockReturnValue({
      employee: mockEmployee,
      setEmergencyDetails: mockSetEmergencyDetails
    });
    (useGetDefaultCountryCode as jest.Mock).mockReturnValue("1");
  });

  describe.each([
    ["primaryEmergencyContact" as ContactType],
    ["secondaryEmergencyContact" as ContactType]
  ])("%s", (contactType) => {
    const testData = contactTestData[contactType];

    it(`should initialize form values correctly for ${contactType}`, () => {
      const { result } = renderHookWithType(contactType);

      expect(result.current.values).toEqual(testData.expectedValues);
    });

    it(`should handle name input changes correctly for ${contactType}`, async () => {
      const { result } = renderHookWithType(contactType);

      await simulateInputChange(result, "name", testData.testInputs.newName);

      expect(result.current.values.name).toBe(testData.testInputs.newName);
      expect(mockSetEmergencyDetails).toHaveBeenCalledWith({
        [contactType]: {
          ...mockEmployee.emergency[contactType],
          name: testData.testInputs.newName
        }
      });
    });

    it(`should handle relationship input changes correctly for ${contactType}`, async () => {
      const { result } = renderHookWithType(contactType);

      await simulateInputChange(
        result,
        "relationship",
        testData.testInputs.newRelationship
      );

      expect(result.current.values.relationship).toBe(
        testData.testInputs.newRelationship
      );
      expect(mockSetEmergencyDetails).toHaveBeenCalledWith({
        [contactType]: {
          ...mockEmployee.emergency[contactType],
          relationship: testData.testInputs.newRelationship
        }
      });
    });

    it(`should handle phone number changes correctly for ${contactType}`, async () => {
      const { result } = renderHookWithType(contactType);

      await simulatePhoneNumberChange(result, testData.testInputs.newContactNo);

      expect(result.current.values.contactNo).toBe(
        testData.testInputs.newContactNo
      );
      expect(mockSetEmergencyDetails).toHaveBeenCalledWith({
        [contactType]: {
          ...mockEmployee.emergency[contactType],
          contactNo: testData.testInputs.expectedStoredContactNo
        }
      });
    });
  });

  describe("common functionality", () => {
    it("should handle country code changes correctly", async () => {
      const { result } = renderHookWithType("primaryEmergencyContact");

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

      const { result } = renderHookWithType("primaryEmergencyContact");

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

      const { result } = renderHookWithType("primaryEmergencyContact");

      expect(result.current.values).toEqual({
        countryCode: "1",
        contactNo: ""
      });
    });
  });
});
