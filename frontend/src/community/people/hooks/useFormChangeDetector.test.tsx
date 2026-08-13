import { renderHook } from "@testing-library/react";

import { usePeopleStore } from "~community/people/store/store";

import useFormChangeDetector from "./useFormChangeDetector";

jest.mock("~community/people/store/store", () => ({
  usePeopleStore: jest.fn()
}));

describe("useFormChangeDetector", () => {
  const mockInitialEmployee = {
    personal: { firstName: "John", lastName: "Doe" },
    employment: { employeeNumber: "123", email: "john.doe@example.com" },
    systemPermissions: { role: "Admin" },
    emergency: { primaryContact: { name: "Jane Doe", phone: "1234567890" } }
  };

  const mockEmployee = {
    personal: { firstName: "John", lastName: "Smith" },
    employment: { employeeNumber: "123", email: "john.doe@example.com" },
    systemPermissions: { role: "User" },
    emergency: { primaryContact: { name: "Jane Doe", phone: "0987654321" } }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should detect changes in personal details", () => {
    (usePeopleStore as jest.Mock).mockReturnValue({
      employee: mockEmployee,
      initialEmployee: mockInitialEmployee,
      currentStep: "personal"
    });

    const { result } = renderHook(() => useFormChangeDetector());
    expect(result.current.hasChanged).toBe(false);
    expect(result.current.apiPayload).toEqual({});
  });

  it("should detect changes in employment details", () => {
    (usePeopleStore as jest.Mock).mockReturnValue({
      employee: mockEmployee,
      initialEmployee: mockInitialEmployee,
      currentStep: "employment"
    });

    const { result } = renderHook(() => useFormChangeDetector());
    expect(result.current.hasChanged).toBe(false);
    expect(result.current.apiPayload).toEqual({});
  });

  it("should detect changes in system permissions", () => {
    (usePeopleStore as jest.Mock).mockReturnValue({
      employee: mockEmployee,
      initialEmployee: mockInitialEmployee,
      currentStep: "permission"
    });

    const { result } = renderHook(() => useFormChangeDetector());
    expect(result.current.hasChanged).toBe(false);
    expect(result.current.apiPayload).toEqual({});
  });

  it("should detect changes in emergency details", () => {
    (usePeopleStore as jest.Mock).mockReturnValue({
      employee: mockEmployee,
      initialEmployee: mockInitialEmployee,
      currentStep: "emergency"
    });

    const { result } = renderHook(() => useFormChangeDetector());
    expect(result.current.hasChanged).toBe(false);
    expect(result.current.apiPayload).toEqual({});
  });

  it("should return no changes when current step is invalid", () => {
    (usePeopleStore as jest.Mock).mockReturnValue({
      employee: mockEmployee,
      initialEmployee: mockInitialEmployee,
      currentStep: "invalidStep"
    });

    const { result } = renderHook(() => useFormChangeDetector());
    expect(result.current.hasChanged).toBe(false);
    expect(result.current.apiPayload).toEqual({});
  });

  describe("add flow", () => {
    const emptyEmployee = {
      personal: { general: { firstName: "", lastName: "" } },
      employment: {},
      systemPermissions: {},
      emergency: {}
    };

    const employeeWithPersonalDetails = {
      ...emptyEmployee,
      personal: { general: { firstName: "Ada", lastName: "Lovelace" } }
    };

    it("should report no change before anything is entered", () => {
      (usePeopleStore as jest.Mock).mockReturnValue({
        employee: emptyEmployee,
        initialEmployee: emptyEmployee,
        currentStep: "Personal"
      });

      const { result } = renderHook(() => useFormChangeDetector(true));
      expect(result.current.hasChanged).toBe(false);
    });

    it.each(["Emergency", "Employment", "System Permissions"])(
      "should still report a change on the %s step left empty",
      (currentStep) => {
        (usePeopleStore as jest.Mock).mockReturnValue({
          employee: employeeWithPersonalDetails,
          initialEmployee: emptyEmployee,
          currentStep
        });

        const { result } = renderHook(() => useFormChangeDetector(true));
        expect(result.current.hasChanged).toBe(true);
      }
    );

    it("should not change the edit flow behaviour for the same state", () => {
      (usePeopleStore as jest.Mock).mockReturnValue({
        employee: employeeWithPersonalDetails,
        initialEmployee: emptyEmployee,
        currentStep: "Emergency"
      });

      const { result } = renderHook(() => useFormChangeDetector());
      expect(result.current.hasChanged).toBe(false);
    });
  });
});
