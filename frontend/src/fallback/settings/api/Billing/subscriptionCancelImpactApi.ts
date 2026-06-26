import { useQuery } from "@tanstack/react-query";

export const useGetSubscriptionCancelImpact = (employeeIds: number[]) => {
  return useQuery({
    queryKey: [],
    queryFn: () => {}
  });
};
