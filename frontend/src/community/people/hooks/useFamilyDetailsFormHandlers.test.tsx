import { act, renderHook } from "@testing-library/react";

import { usePeopleStore } from "~community/people/store/store";

import useFamilyDetailsFormHandlers from "./useFamilyDetailsFormHandlers";

jest.mock("~community/people/store/store", () => ({
  usePeopleStore: jest.fn()
}));

describe("useFamilyDetailsFormHandlers", () => {
  const mockSetPersonalDetails = jest.fn();
  const mockEmployee = {
    personal: {
      general: {
        maritalStatus: "Single"
      },
      family: [
        {
          familyId: 1,
          firstName: "John",
          lastName: "Doe",
          gender: "Male",
          relationship: "Sibling",
          parentName: "Parent Name",
          dateOfBirth: "2000-01-01"
        }
      ]
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (usePeopleStore as jest.Mock).mockReturnValue({
      employee: mockEmployee,
      setPersonalDetails: mockSetPersonalDetails
    });
  });

  it("should initialize form values correctly", () => {
    const { result } = renderHook(() => useFamilyDetailsFormHandlers());
    expect(result.current.values).toEqual({
      familyId: undefined,
      firstName: "",
      lastName: "",
      gender: undefined,
      relationship: undefined,
      parentName: "",
      dateOfBirth: ""
    });
  });

  it("should handle input changes correctly", async () => {
    const { result } = renderHook(() => useFamilyDetailsFormHandlers());

    await act(async () => {
      result.current.handleInput({
        target: { name: "firstName", value: "Jane" }
      } as any);
    });

    expect(result.current.values.firstName).toBe("Jane");
  });

  it("should handle date changes correctly", async () => {
    const { result } = renderHook(() => useFamilyDetailsFormHandlers());

    await act(async () => {
      await result.current.handleDateChange("2023-01-01");
    });

    expect(result.current.values.dateOfBirth).toBe("2023-01-01T05:30:00.000");
  });

  it("should handle editing a family member", () => {
    const { result } = renderHook(() => useFamilyDetailsFormHandlers());

    act(() => {
      result.current.setRowEdited(0);
    });

    expect(result.current.values).toEqual({
      familyId: 1,
      firstName: "John",
      lastName: "Doe",
      gender: "Male",
      relationship: "Sibling",
      parentName: "Parent Name",
      dateOfBirth: "2000-01-01"
    });
  });

  it("should handle submitting a new family member", async () => {
    const { result } = renderHook(() => useFamilyDetailsFormHandlers());

    await act(async () => {
      result.current.setFieldValue("firstName", "Jane");
      result.current.setFieldValue("lastName", "Smith");
      result.current.setFieldValue("gender", "Female");
      result.current.setFieldValue("relationship", "Sibling");
      result.current.setFieldValue("parentName", "Parent Name");
      result.current.setFieldValue("dateOfBirth", "1995-01-01");
      await result.current.handleSubmit();
    });
  });

  it("should handle deleting a family member", () => {
    const { result } = renderHook(() => useFamilyDetailsFormHandlers());

    act(() => {
      result.current.setRowEdited(0);
      result.current.resetForm();
    });
  });
});
