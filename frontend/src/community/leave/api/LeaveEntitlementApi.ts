import {
  UseQueryResult,
  useMutation,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";

import { BulkUploadResponse } from "~community/common/types/BulkUploadTypes";
import {
  SortKeyTypes,
  SortOrderTypes
} from "~community/common/types/CommonTypes";
import authFetch from "~community/common/utils/axiosInterceptor";
import { leaveEntitlementEndPoints } from "~community/leave/api/utils/ApiEndpoints";
import { leaveEntitlementQueryKeys } from "~community/leave/api/utils/QueryKeys";
import {
  LeaveEntitlementBulkPayloadType,
  LeaveEntitlementResponseType,
  LeaveEntitlementType
} from "~community/leave/types/LeaveEntitlementTypes";

export const useGetLeaveEntitlements = (
  selectedYear: string,
  page: number,
  keyword: string
): UseQueryResult<LeaveEntitlementResponseType> => {
  const pageParams = {
    page: page - 1,
    size: 5,
    year: selectedYear,
    isExport: false,
    sortOrder: SortOrderTypes.ASC,
    keyword: keyword,
    sortKey: SortKeyTypes.CREATED_DATE
  };

  return useQuery({
    queryKey: leaveEntitlementQueryKeys.LEAVE_ENTITLEMENTS(pageParams),
    queryFn: () =>
      authFetch.get(leaveEntitlementEndPoints.GET_LEAVE_ENTITLEMENTS, {
        params: pageParams
      }),
    select: (data) => {
      const results = data.data.results ?? [];

      return results[0];
    }
  });
};

export const useGetAllLeaveEntitlements = (
  selectedYear: string
): UseQueryResult<LeaveEntitlementType[]> => {
  const pageParams = {
    page: 0,
    size: 1,
    year: selectedYear,
    isExport: true,
    sortOrder: SortOrderTypes.ASC,
    sortKey: SortKeyTypes.CREATED_DATE
  };

  return useQuery({
    queryKey: leaveEntitlementQueryKeys.ALL_LEAVE_ENTITLEMENTS(pageParams),
    queryFn: () =>
      authFetch.get(leaveEntitlementEndPoints.GET_LEAVE_ENTITLEMENTS, {
        params: pageParams
      }),
    select: (data) => {
      const results = data.data.results ?? [];
      return results;
    }
  });
};

export const useLeaveEntitlementBulkUpload = (
  onSuccess: (errorLogs: BulkUploadResponse) => void,
  onError: () => void
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (leaveEntitlementBulk: LeaveEntitlementBulkPayloadType) => {
      return authFetch.post(
        leaveEntitlementEndPoints.ADD_BULK_LEAVE_ENTITLEMENTS,
        leaveEntitlementBulk
      );
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: leaveEntitlementQueryKeys.LEAVE_ENTITLEMENTS()
      });
      const results = data.data.results[0] ?? [];

      onSuccess(results);
    },
    onError
  });
};
