import { EmployeeRoleLimit } from "../types/EmployeeTypes";
import { useGetEmployeeRoleLimit } from "./peopleApi";

describe("useGetEmployeeRoleLimit", () => {
  beforeEach(() => {
    // Clear any previous mocks
    jest.restoreAllMocks();
  });

  it("should call onSuccess when mutate is successful", async () => {
    const mockOnSuccess = jest.fn();
    const mockOnError = jest.fn();
    const mockResponse: EmployeeRoleLimit = {
      leaveAdminLimitExceeded: false,
      attendanceAdminLimitExceeded: false,
      peopleAdminLimitExceeded: false,
      leaveManagerLimitExceeded: false,
      attendanceManagerLimitExceeded: false,
      peopleManagerLimitExceeded: false,
      superAdminLimitExceeded: false,
      esignAdminLimitExceeded: false,
      esignSenderLimitExceeded: false,
      pmAdminLimitExceeded: false
    };

    const { mutate } = useGetEmployeeRoleLimit(mockOnSuccess, mockOnError);

    // Mock the global fetch function to simulate success
    global.fetch = jest.fn().mockResolvedValueOnce({
      json: async () => mockResponse
    } as Response);

    await mutate();

    expect(mockOnError).not.toHaveBeenCalled();
  });

  it("should call onError when mutate fails", async () => {
    const mockOnSuccess = jest.fn();
    const mockOnError = jest.fn();
    const mockError = new Error("Failed to fetch");

    const { mutate } = useGetEmployeeRoleLimit(mockOnSuccess, mockOnError);

    // Mock the global fetch function to simulate failure
    global.fetch = jest.fn().mockRejectedValueOnce(mockError);

    await mutate();
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });
});
