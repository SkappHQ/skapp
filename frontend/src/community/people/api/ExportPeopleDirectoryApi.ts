import { useMutation } from "@tanstack/react-query";

import authFetch from "~community/common/utils/axiosInterceptor";

import { EmploymentStatusTypes } from "../types/EmployeeTypes";
import { peoplesEndpoints } from "./utils/ApiEndpoints";

interface ExportPeopleDirectoryType {
  sortKey?: string;
  sortOrder?: string;
  searchKeyword?: string;
  isExport?: boolean;
  accountStatus?: EmploymentStatusTypes[];
  employmentAllocations?: string[];
  permissions?: string[];
  team?: (string | number | undefined)[];
  role?: (string | number | undefined)[];
  employmentTypes?: string[];
  gender?: string[];
  nationality?: string[];
}

interface UseExportPeopleDirectoryOptions {
  enabled?: boolean;
  retry?: boolean | number;
}

// Simplified query string builder
const buildQueryString = (params: ExportPeopleDirectoryType): string => {
  const searchParams = new URLSearchParams();

  // Handle simple parameters
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (Array.isArray(value) && value.length > 0) {
      // Handle arrays
      value.forEach((item) => {
        if (item !== undefined && item !== null) {
          searchParams.append(key, String(item));
        }
      });
    } else if (!Array.isArray(value) && value !== "") {
      // Handle non-array values
      searchParams.append(key, String(value));
    }
  });

  return searchParams.toString() ? `?${searchParams.toString()}` : "";
};
interface UseExportPeopleDirectoryOptions {
  onSuccess?: (data: any[]) => void;
  onError?: (error: Error) => void;
}

export const useExportPeopleDirectory = (
  options?: UseExportPeopleDirectoryOptions
) => {
  return useMutation({
    mutationFn: async (params: ExportPeopleDirectoryType) => {
      const response = await authFetch.get(
        peoplesEndpoints.EXPORT_PEOPLE_DIRECTORY + buildQueryString(params)
      );

      if (response.data.status === "successful" && response.data.results) {
        return response.data.results;
      }

      throw new Error("Export failed");
    },
    onSuccess: options?.onSuccess,
    onError: options?.onError,
    retry: false
  });
};
