import { EmployeeRoleLimit } from "../types/EmployeeTypes";

export const useGetEmployeeRoleLimit = (
  onSuccess: (response: EmployeeRoleLimit) => void,
  onError: (error: unknown) => void
) => {
  return {
    mutate: async () => {}
  };
};
