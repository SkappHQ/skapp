import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { ReactNode } from "react";

import authFetch from "~community/common/utils/axiosInterceptor";
import { useGetPolicyAbsenceRate } from "~community/leave/api/PolicyLeaveApi";
import { policyLeaveEndPoints } from "~community/leave/api/utils/ApiEndpoints";
import { AbsenceRateKpiTypes } from "~community/leave/enums/AnalyticsEnums";

jest.mock("~community/common/utils/axiosInterceptor", () => ({
  __esModule: true,
  default: { get: jest.fn() }
}));

const mockedGet = authFetch.get as jest.Mock;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return Wrapper;
};

describe("useGetPolicyAbsenceRate", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("returns the first result for the selected team", async () => {
    const absenceRate = {
      type: AbsenceRateKpiTypes.CURRENT_ABSENCE_RATE,
      currentAbsenceRate: 12.5,
      monthBeforeAbsenceRate: 8
    };
    mockedGet.mockResolvedValue({ data: { results: [absenceRate] } });

    const { result } = renderHook(() => useGetPolicyAbsenceRate(3), {
      wrapper: createWrapper()
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(absenceRate);
    expect(mockedGet).toHaveBeenCalledWith(
      policyLeaveEndPoints.GET_ABSENCE_RATE,
      { params: { teamIds: 3 } }
    );
  });

  test("does not fetch before a team is selected", () => {
    const { result } = renderHook(() => useGetPolicyAbsenceRate(""), {
      wrapper: createWrapper()
    });

    expect(result.current.fetchStatus).toBe("idle");
    expect(mockedGet).not.toHaveBeenCalled();
  });

  test("does not fetch when disabled", () => {
    const { result } = renderHook(() => useGetPolicyAbsenceRate(3, false), {
      wrapper: createWrapper()
    });

    expect(result.current.fetchStatus).toBe("idle");
    expect(mockedGet).not.toHaveBeenCalled();
  });
});
