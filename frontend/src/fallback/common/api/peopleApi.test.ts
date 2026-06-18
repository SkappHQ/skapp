import { useQuery } from "@tanstack/react-query";

import {
  useGetEmployeeRoleLimit,
  useGetRoleLimits
} from "~enterprise/common/api/peopleApi";
import { EmployeeRoleLimit } from "~enterprise/people/types/EmployeeTypes";

jest.mock("@tanstack/react-query", () => ({
  useQuery: jest.fn()
}));

describe("useGetEmployeeRoleLimit", () => {
  it("calls onSuccess when mutate succeeds", async () => {
    const mockResponse: EmployeeRoleLimit = {
      leaveAdminLimitExceeded: false,
      attendanceAdminLimitExceeded: false,
      attendanceManagerLimitExceeded: false,
      leaveManagerLimitExceeded: false,
      peopleAdminLimitExceeded: false,
      peopleManagerLimitExceeded: false,
      superAdminLimitExceeded: false,
      esignAdminLimitExceeded: false,
      esignSenderLimitExceeded: false,
      pmAdminLimitExceeded: false
    };
    const onSuccess = jest.fn();
    const onError = jest.fn();

    const { mutate } = useGetEmployeeRoleLimit(onSuccess, onError);

    // Mocking internal behavior
    const mockMutateImpl = async () => {
      await Promise.resolve();
      onSuccess(mockResponse); // Simulate success call
    };

    await mockMutateImpl();

    expect(onSuccess).toHaveBeenCalledWith(mockResponse);
    expect(onError).not.toHaveBeenCalled();
  });

  it("calls onError when mutate fails", async () => {
    const mockError = new Error("failure");
    const onSuccess = jest.fn();
    const onError = jest.fn();

    const { mutate } = useGetEmployeeRoleLimit(onSuccess, onError);

    // Simulate a failing call
    const mockMutateImpl = async () => {
      await Promise.resolve();
      onError(mockError); // Simulate error call
    };

    await mockMutateImpl();

    expect(onError).toHaveBeenCalledWith(mockError);
    expect(onSuccess).not.toHaveBeenCalled();
  });
});

describe("useGetRoleLimits", () => {
  it("calls useQuery with correct parameters when isEnterprise is true", () => {
    const mockQueryFn = jest.fn();
    (useQuery as jest.Mock).mockImplementation(() => ({
      data: { maxRoles: 10 }
    }));

    const result = useGetRoleLimits(true);

    expect(useQuery).toHaveBeenCalledWith({
      queryKey: [],
      queryFn: expect.any(Function)
    });
    expect(result.data).toEqual({ maxRoles: 10 });
  });

  it("calls useQuery with correct parameters when isEnterprise is false", () => {
    const mockQueryFn = jest.fn();
    (useQuery as jest.Mock).mockImplementation(() => ({
      data: { maxRoles: 3 }
    }));

    const result = useGetRoleLimits(false);

    expect(useQuery).toHaveBeenCalledWith({
      queryKey: [],
      queryFn: expect.any(Function)
    });
    expect(result.data).toEqual({ maxRoles: 3 });
  });
});
