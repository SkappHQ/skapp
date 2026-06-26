import { act, renderHook } from "@testing-library/react";

import { usePeopleStore } from "~community/people/store/store";

import usePreviousEmploymentDetailsFormHandlers from "./usePreviousEmploymentDetailsFormHandlers";

jest.mock("~community/people/store/store", () => ({
  usePeopleStore: jest.fn()
}));

describe("usePreviousEmploymentDetailsFormHandlers", () => {
  const mockSetEmploymentDetails = jest.fn();
  const mockEmployee = {
    employment: {
      previousEmployment: [
        {
          employmentId: 1,
          companyName: "Company A",
          jobTitle: "Developer",
          startDate: "2020-01-01",
          endDate: "2021-01-01"
        }
      ]
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (usePeopleStore as jest.Mock).mockReturnValue({
      employee: mockEmployee,
      setEmploymentDetails: mockSetEmploymentDetails
    });
  });

  it("should initialize form values correctly", () => {
    const { result } = renderHook(() =>
      usePreviousEmploymentDetailsFormHandlers()
    );

    expect(result.current.values).toEqual({
      employmentId: undefined,
      companyName: "",
      jobTitle: "",
      startDate: "",
      endDate: ""
    });
  });

  it("should handle input changes correctly", async () => {
    const { result } = renderHook(() =>
      usePreviousEmploymentDetailsFormHandlers()
    );

    await act(async () => {
      await result.current.handleInput({
        target: { name: "companyName", value: "Company B" }
      } as any);
    });

    expect(result.current.values.companyName).toBe("Company B");
  });

  it("should handle date changes correctly", async () => {
    const { result } = renderHook(() =>
      usePreviousEmploymentDetailsFormHandlers()
    );

    await act(async () => {
      await result.current.dateOnChange("startDate", "2022-01-01");
    });

    expect(result.current.values.startDate).toBe("2022-01-01");
  });

  it("should submit the form and add a new employment record", async () => {
    const { result } = renderHook(() =>
      usePreviousEmploymentDetailsFormHandlers()
    );

    await act(async () => {
      result.current.values.companyName = "Company C";
      result.current.values.jobTitle = "Manager";
      result.current.values.startDate = "2022-01-01";
      result.current.values.endDate = "2023-01-01";
      await result.current.handleSubmit();
    });

    expect(mockSetEmploymentDetails).toHaveBeenCalledWith({
      ...mockEmployee.employment,
      previousEmployment: [
        ...mockEmployee.employment.previousEmployment,
        {
          employmentId: 2,
          companyName: "Company C",
          jobTitle: "Manager",
          startDate: "2022-01-01",
          endDate: "2023-01-01"
        }
      ]
    });
  });

  it("should edit an existing employment record", async () => {
    const { result } = renderHook(() =>
      usePreviousEmploymentDetailsFormHandlers()
    );

    act(() => {
      result.current.handleEdit(0);
    });

    await act(async () => {
      result.current.values.companyName = "Updated Company A";
      await result.current.handleSubmit();
    });

    expect(mockSetEmploymentDetails).toHaveBeenCalledWith({
      ...mockEmployee.employment,
      previousEmployment: [
        {
          employmentId: 1,
          companyName: "Updated Company A",
          jobTitle: "Developer",
          startDate: "2020-01-01",
          endDate: "2021-01-01"
        }
      ]
    });
  });

  it("should delete an employment record", () => {
    const { result } = renderHook(() =>
      usePreviousEmploymentDetailsFormHandlers()
    );

    act(() => {
      result.current.handleDelete(0);
    });

    expect(mockSetEmploymentDetails).toHaveBeenCalledWith({
      ...mockEmployee.employment,
      previousEmployment: []
    });
  });

  it("should format table data correctly", () => {
    const { result } = renderHook(() =>
      usePreviousEmploymentDetailsFormHandlers()
    );

    const formattedData = result.current.formatTableData(
      mockEmployee.employment.previousEmployment
    );

    expect(formattedData).toEqual([
      {
        companyName: "Company A",
        jobTitle: "Developer",
        startDate: "2020-01-01",
        endDate: "2021-01-01"
      }
    ]);
  });
});
