import { act, renderHook } from "@testing-library/react";

import { usePeopleStore } from "~community/people/store/store";

import useGeneralDetailsFormHandlers from "./useGeneralDetailsFormHandlers";

jest.mock("~community/people/store/store", () => ({
  usePeopleStore: jest.fn()
}));

describe("useGeneralDetailsFormHandlers", () => {
  const mockSetPersonalDetails = jest.fn();
  const mockEmployee = {
    personal: {
      general: {
        firstName: "John",
        lastName: "Doe",
        dateOfBirth: "1990-01-01",
        nationality: "US"
      }
    }
  };

  const mockFormik = {
    values: {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      nationality: ""
    },
    setFieldValue: jest.fn(),
    setFieldError: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (usePeopleStore as jest.Mock).mockReturnValue({
      employee: mockEmployee,
      setPersonalDetails: mockSetPersonalDetails
    });
  });

  it("should calculate age correctly based on date of birth", () => {
    const { result } = renderHook(() =>
      useGeneralDetailsFormHandlers({ formik: mockFormik as any })
    );

    act(() => {
      mockFormik.values.dateOfBirth = "1990-01-01";
      result.current.setSelectedDob(new Date("1990-01-01"));
    });

    expect(result.current.age).toBe(new Date().getFullYear() - 1990);
  });

  it("should handle name changes correctly", async () => {
    const { result } = renderHook(() =>
      useGeneralDetailsFormHandlers({ formik: mockFormik as any })
    );

    await act(async () => {
      await result.current.handleChange({
        target: { name: "firstName", value: "Jane" }
      } as any);
    });

    expect(mockFormik.setFieldValue).toHaveBeenCalledWith("firstName", "Jane");
    expect(mockSetPersonalDetails).toHaveBeenCalledWith({
      general: { ...mockEmployee.personal.general, firstName: "Jane" }
    });
  });

  it("should handle nationality selection correctly", async () => {
    const { result } = renderHook(() =>
      useGeneralDetailsFormHandlers({ formik: mockFormik as any })
    );

    await act(async () => {
      await result.current.handleNationalitySelect(null, { value: "CA" });
    });

    expect(mockFormik.setFieldValue).toHaveBeenCalledWith("nationality", "CA");
    expect(mockSetPersonalDetails).toHaveBeenCalledWith({
      general: { ...mockEmployee.personal.general, nationality: "CA" }
    });
  });

  it("should handle date changes correctly", async () => {
    const { result } = renderHook(() =>
      useGeneralDetailsFormHandlers({ formik: mockFormik as any })
    );

    await act(async () => {
      await result.current.dateOnChange("dateOfBirth", "2000-01-01");
    });

    expect(mockFormik.setFieldValue).toHaveBeenCalledWith(
      "dateOfBirth",
      "2000-01-01"
    );
    expect(mockSetPersonalDetails).toHaveBeenCalledWith({
      general: { ...mockEmployee.personal.general, dateOfBirth: "2000-01-01" }
    });
  });

  it("should reset age and selected date when dateOfBirth is empty", () => {
    const { result } = renderHook(() =>
      useGeneralDetailsFormHandlers({ formik: mockFormik as any })
    );

    act(() => {
      mockFormik.values.dateOfBirth = "";
      result.current.setSelectedDob(undefined);
    });

    expect(result.current.age).toBe("-");
    expect(result.current.selectedDob).toBeUndefined();
  });
});
