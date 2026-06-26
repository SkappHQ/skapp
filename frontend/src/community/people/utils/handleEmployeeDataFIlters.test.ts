import { DataFilterEnums } from "../types/EmployeeTypes";
import { handleApplyFilterPrams } from "./handleEmployeeDataFIlters";

describe("handleApplyFilterPrams", () => {
  let mockSetEmployeeDataParams: jest.Mock;

  beforeEach(() => {
    mockSetEmployeeDataParams = jest.fn();
  });

  it("should handle empty filter object", () => {
    const emptyFilter = {};
    handleApplyFilterPrams(mockSetEmployeeDataParams, emptyFilter);
    expect(mockSetEmployeeDataParams).toHaveBeenCalledTimes(6);
  });

  it("should handle employmentTypes filter", () => {
    const filter = {
      employmentTypes: ["full-time", "part-time"]
    };

    handleApplyFilterPrams(mockSetEmployeeDataParams, filter);

    expect(mockSetEmployeeDataParams).toHaveBeenCalledWith(
      DataFilterEnums.EMPLOYMENT_TYPES,
      ["FULL-TIME", "PART-TIME"]
    );
  });

  it("should handle employmentStatus filter", () => {
    const filter = {
      accountStatus: ["ACTIVE", "INACTIVE"]
    };

    handleApplyFilterPrams(mockSetEmployeeDataParams, filter);

    expect(mockSetEmployeeDataParams).toHaveBeenCalledWith(
      DataFilterEnums.ACCOUNT_STATUS,
      ["ACTIVE", "INACTIVE"]
    );
  });

  it("should handle nationality filter", () => {
    const filter = {
      nationality: ["usa", "uk"]
    };

    handleApplyFilterPrams(mockSetEmployeeDataParams, filter);

    expect(mockSetEmployeeDataParams).toHaveBeenCalledWith(
      DataFilterEnums.NATIONALITY,
      ["USA", "UK"]
    );
  });

  it("should handle employmentAllocations filter", () => {
    const filter = {
      employmentAllocations: ["internal", "external"]
    };

    handleApplyFilterPrams(mockSetEmployeeDataParams, filter);

    expect(mockSetEmployeeDataParams).toHaveBeenCalledWith(
      DataFilterEnums.EMPLOYMENT_ALLOCATIONS,
      ["INTERNAL", "EXTERNAL"]
    );
  });

  it("should handle gender filter", () => {
    const filter = {
      gender: "MALE"
    };

    handleApplyFilterPrams(mockSetEmployeeDataParams, filter);

    expect(mockSetEmployeeDataParams).toHaveBeenCalledWith(
      DataFilterEnums.GENDER,
      "MALE"
    );
  });

  it("should handle team filter", () => {
    const filter = {
      team: [{ id: 1 }, { id: 2 }]
    };

    handleApplyFilterPrams(mockSetEmployeeDataParams, filter);

    expect(mockSetEmployeeDataParams).toHaveBeenCalledWith(
      DataFilterEnums.TEAM,
      [1, 2]
    );
  });

  it("should handle role filter", () => {
    const filter = {
      role: [{ id: 1 }, { id: 2 }]
    };

    handleApplyFilterPrams(mockSetEmployeeDataParams, filter);

    expect(mockSetEmployeeDataParams).toHaveBeenCalledWith(
      DataFilterEnums.ROLE,
      [1, 2]
    );
  });

  it("should handle permission filter", () => {
    const filter = {
      permission: ["read", "write"]
    };

    handleApplyFilterPrams(mockSetEmployeeDataParams, filter);

    expect(mockSetEmployeeDataParams).toHaveBeenCalledWith(
      DataFilterEnums.PERMISSION,
      ["READ", "WRITE"]
    );
  });

  it("should handle multiple filters simultaneously", () => {
    const filter = {
      employmentTypes: ["full-time"],
      nationality: ["usa"],
      gender: "FEMALE",
      team: [{ id: 1 }]
    };

    handleApplyFilterPrams(mockSetEmployeeDataParams, filter);

    expect(mockSetEmployeeDataParams).toHaveBeenCalledTimes(7);
    expect(mockSetEmployeeDataParams).toHaveBeenCalledWith(
      DataFilterEnums.EMPLOYMENT_TYPES,
      ["FULL-TIME"]
    );
    expect(mockSetEmployeeDataParams).toHaveBeenCalledWith(
      DataFilterEnums.NATIONALITY,
      ["USA"]
    );
    expect(mockSetEmployeeDataParams).toHaveBeenCalledWith(
      DataFilterEnums.GENDER,
      "FEMALE"
    );
    expect(mockSetEmployeeDataParams).toHaveBeenCalledWith(
      DataFilterEnums.TEAM,
      [1]
    );
  });
});
