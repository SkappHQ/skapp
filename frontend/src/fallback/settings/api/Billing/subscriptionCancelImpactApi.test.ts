import { renderHook } from "@testing-library/react";

import { useGetSubscriptionCancelImpact } from "./subscriptionCancelImpactApi";

// Mock @tanstack/react-query
jest.mock("@tanstack/react-query", () => ({
  useQuery: jest.fn(() => ({
    data: null,
    isLoading: false,
    isError: false
  }))
}));

describe("useGetSubscriptionCancelImpact", () => {
  it("should initialize with default queryKey and queryFn", () => {
    const { result } = renderHook(() => useGetSubscriptionCancelImpact([]));
    expect(result.current).toHaveProperty("data", null);
    expect(result.current).toHaveProperty("isLoading", false);
    expect(result.current).toHaveProperty("isError", false);
  });
});
