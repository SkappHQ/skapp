import { act, renderHook } from "@testing-library/react";

import { usePeopleStore } from "~community/people/store/store";

import useEducationalDetailsFormHandlers from "./useEducationalDetailsFormHandlers";

jest.mock("~community/people/store/store", () => ({
  usePeopleStore: jest.fn()
}));

describe("useEducationalDetailsFormHandlers", () => {
  const mockSetPersonalDetails = jest.fn();
  const mockEmployee = {
    personal: {
      educational: [
        {
          educationId: 1,
          institutionName: "University A",
          degree: "BSc",
          major: "Computer Science",
          startDate: "2020-01-01",
          endDate: "2023-01-01"
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
    const { result } = renderHook(() => useEducationalDetailsFormHandlers());
    expect(result.current.values).toEqual({
      institutionName: "",
      degree: "",
      major: "",
      startDate: "",
      endDate: ""
    });
  });

  it("should handle input changes correctly", async () => {
    const { result } = renderHook(() => useEducationalDetailsFormHandlers());

    await act(async () => {
      result.current.handleInput({
        target: { name: "institutionName", value: "New University" }
      } as any);
    });

    expect(result.current.values.institutionName).toBe("New University");
  });

  it("should handle date changes correctly", async () => {
    const { result } = renderHook(() => useEducationalDetailsFormHandlers());

    await act(async () => {
      await result.current.dateOnChange("startDate", "2022-01-01");
    });

    expect(result.current.values.startDate).toBe("2022-01-01");
  });

  it("should handle editing an educational detail", () => {
    const { result } = renderHook(() => useEducationalDetailsFormHandlers());

    act(() => {
      result.current.handleEdit(0);
    });

    expect(result.current.values).toEqual({
      institutionName: "University A",
      educationId: 1,
      degree: "BSc",
      major: "Computer Science",
      startDate: "2020-01-01",
      endDate: "2023-01-01"
    });
  });

  it("should handle deleting an educational detail", () => {
    const { result } = renderHook(() => useEducationalDetailsFormHandlers());

    act(() => {
      result.current.handleDelete(0);
    });

    expect(mockSetPersonalDetails).toHaveBeenCalledWith({
      general: mockEmployee.personal.general,
      educational: []
    });
  });

  it("should handle submitting a new educational detail", async () => {
    const { result } = renderHook(() => useEducationalDetailsFormHandlers());

    await act(async () => {
      result.current.setFieldValue("institutionName", "University B");
      result.current.setFieldValue("degree", "MSc");
      result.current.setFieldValue("major", "Data Science");
      result.current.setFieldValue("startDate", "2024-01-01");
      result.current.setFieldValue("endDate", "2026-01-01");
      await result.current.handleSubmit();
    });
  });
});
