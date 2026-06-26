import { useQuery } from "@tanstack/react-query";

import { EmployeeRoleLimit } from "~fallback/people/types/EmployeeTypes";

export const useGetEmployeeRoleLimit = (
  onSuccess: (response: EmployeeRoleLimit) => void,
  onError: (error: unknown) => void
) => {
  return {
    mutate: async () => {}
  };
};

export const useGetRoleLimits = (isEnterprise: boolean) => {
  return useQuery({
    queryKey: [],
    queryFn: () => {}
  });
};
