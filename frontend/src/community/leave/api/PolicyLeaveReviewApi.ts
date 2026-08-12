import {
  UseMutationResult,
  UseQueryResult,
  skipToken,
  useMutation,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";

import { ErrorResponse } from "~community/common/types/CommonTypes";
import authFetch from "~community/common/utils/axiosInterceptor";
import { policyLeaveReviewEndPoints } from "~community/leave/api/utils/ApiEndpoints";
import {
  policyLeaveQueryKeys,
  policyLeaveReviewQueryKeys
} from "~community/leave/api/utils/QueryKeys";
import {
  PolicyLeaveCancelPayload,
  PolicyLeaveNudgeStatusResponse,
  PolicyLeaveNudgeStatusType,
  PolicyLeaveRequestDetailResponse,
  PolicyLeaveRequestDetailType,
  PolicyLeaveReviewPayload,
  PolicyManagerLeaveRequestListResponse,
  PolicyManagerLeaveRequestPageResponse,
  PolicyManagerLeaveRequestPageType,
  PolicyManagerLeaveRequestQueryParams,
  PolicyManagerLeaveRequestType
} from "~community/leave/types/PolicyLeaveReviewTypes";
import { PolicyLeaveRequestStatus } from "~community/leave/types/PolicyLeaveTypes";

const getPolicyManagerLeaveRequests = async (
  queryParams: PolicyManagerLeaveRequestQueryParams
): Promise<PolicyManagerLeaveRequestPageType> => {
  const response = await authFetch.get<PolicyManagerLeaveRequestPageResponse>(
    policyLeaveReviewEndPoints.GET_MANAGER_POLICY_LEAVE_REQUESTS,
    { params: queryParams }
  );
  return response.data.results[0];
};

export const useGetPolicyManagerLeaveRequests = (
  queryParams: PolicyManagerLeaveRequestQueryParams,
  enabled = true
): UseQueryResult<PolicyManagerLeaveRequestPageType> => {
  return useQuery({
    queryKey: policyLeaveReviewQueryKeys.MANAGER_REQUESTS(queryParams),
    queryFn: () => getPolicyManagerLeaveRequests(queryParams),
    enabled,
    refetchOnWindowFocus: false
  });
};

const getPendingPolicyLeaveRequests = async (
  searchKeyword: string
): Promise<PolicyManagerLeaveRequestType[]> => {
  const response = await authFetch.get<PolicyManagerLeaveRequestListResponse>(
    policyLeaveReviewEndPoints.GET_PENDING_POLICY_LEAVE_REQUESTS,
    { params: { searchKeyword: searchKeyword || undefined } }
  );
  return response.data.results;
};

export const useGetPendingPolicyLeaveRequests = (
  searchKeyword: string,
  enabled = true
): UseQueryResult<PolicyManagerLeaveRequestType[]> => {
  return useQuery({
    queryKey: policyLeaveReviewQueryKeys.PENDING_REQUESTS(searchKeyword),
    queryFn: () => getPendingPolicyLeaveRequests(searchKeyword),
    enabled,
    refetchOnWindowFocus: false
  });
};

const getPolicyLeaveRequestDetail = async (
  url: string
): Promise<PolicyLeaveRequestDetailType> => {
  const response = await authFetch.get<PolicyLeaveRequestDetailResponse>(url);
  return response.data.results[0];
};

export const useGetPolicyManagerLeaveRequestById = (
  leaveRequestId: number | null
): UseQueryResult<PolicyLeaveRequestDetailType> => {
  return useQuery({
    queryKey: policyLeaveReviewQueryKeys.MANAGER_REQUEST(leaveRequestId),
    queryFn:
      leaveRequestId === null
        ? skipToken
        : () =>
            getPolicyLeaveRequestDetail(
              policyLeaveReviewEndPoints.MANAGER_POLICY_LEAVE_REQUEST(
                leaveRequestId
              )
            ),
    refetchOnWindowFocus: false
  });
};

export const useGetMyPolicyLeaveRequestById = (
  leaveRequestId: number | null
): UseQueryResult<PolicyLeaveRequestDetailType> => {
  return useQuery({
    queryKey: policyLeaveReviewQueryKeys.MY_REQUEST(leaveRequestId),
    queryFn:
      leaveRequestId === null
        ? skipToken
        : () =>
            getPolicyLeaveRequestDetail(
              policyLeaveReviewEndPoints.MY_POLICY_LEAVE_REQUEST(leaveRequestId)
            ),
    refetchOnWindowFocus: false
  });
};

const reviewPolicyLeaveRequest = async ({
  leaveRequestId,
  status,
  reviewerComment
}: PolicyLeaveReviewPayload): Promise<PolicyLeaveRequestDetailType> => {
  const response = await authFetch.patch<PolicyLeaveRequestDetailResponse>(
    policyLeaveReviewEndPoints.MANAGER_POLICY_LEAVE_REQUEST(leaveRequestId),
    { status, reviewerComment }
  );
  return response.data.results[0];
};

export const useReviewPolicyLeaveRequest = (
  onSuccess: (data: PolicyLeaveRequestDetailType) => void,
  onError: (messageKey: string) => void
): UseMutationResult<
  PolicyLeaveRequestDetailType,
  ErrorResponse,
  PolicyLeaveReviewPayload
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reviewPolicyLeaveRequest,
    onSuccess: (data) => {
      queryClient.setQueryData(
        policyLeaveReviewQueryKeys.MANAGER_REQUEST(data.leaveRequestId),
        data
      );
      queryClient.invalidateQueries({
        queryKey: policyLeaveReviewQueryKeys.ALL
      });
      queryClient.invalidateQueries({ queryKey: policyLeaveQueryKeys.ALL });
      onSuccess(data);
    },
    onError: (error: ErrorResponse) => {
      onError(error?.response?.data?.results?.[0]?.messageKey ?? "");
    }
  });
};

const cancelMyPolicyLeaveRequest = async ({
  leaveRequestId
}: PolicyLeaveCancelPayload): Promise<PolicyLeaveRequestDetailType> => {
  const response = await authFetch.patch<PolicyLeaveRequestDetailResponse>(
    policyLeaveReviewEndPoints.MY_POLICY_LEAVE_REQUEST(leaveRequestId),
    { status: PolicyLeaveRequestStatus.CANCELLED }
  );
  return response.data.results[0];
};

export const useCancelMyPolicyLeaveRequest = (
  onSuccess: (data: PolicyLeaveRequestDetailType) => void,
  onError: (messageKey: string) => void
): UseMutationResult<
  PolicyLeaveRequestDetailType,
  ErrorResponse,
  PolicyLeaveCancelPayload
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelMyPolicyLeaveRequest,
    onSuccess: (data) => {
      queryClient.setQueryData(
        policyLeaveReviewQueryKeys.MY_REQUEST(data.leaveRequestId),
        data
      );
      queryClient.invalidateQueries({
        queryKey: policyLeaveReviewQueryKeys.ALL
      });
      queryClient.invalidateQueries({ queryKey: policyLeaveQueryKeys.ALL });
      onSuccess(data);
    },
    onError: (error: ErrorResponse) => {
      onError(error?.response?.data?.results?.[0]?.messageKey ?? "");
    }
  });
};

const getPolicyLeaveRequestNudgeStatus = async (
  leaveRequestId: number
): Promise<PolicyLeaveNudgeStatusType> => {
  const response = await authFetch.get<PolicyLeaveNudgeStatusResponse>(
    policyLeaveReviewEndPoints.GET_POLICY_LEAVE_REQUEST_NUDGE_STATUS(
      leaveRequestId
    )
  );
  return response.data.results[0];
};

export const useCheckPolicyLeaveAlreadyNudged = (
  leaveRequestId: number | null
): UseQueryResult<PolicyLeaveNudgeStatusType> => {
  return useQuery({
    queryKey: policyLeaveReviewQueryKeys.NUDGE_STATUS(leaveRequestId),
    queryFn:
      leaveRequestId === null
        ? skipToken
        : () => getPolicyLeaveRequestNudgeStatus(leaveRequestId),
    refetchOnWindowFocus: false
  });
};

const nudgePolicyLeaveRequestManagers = async (
  leaveRequestId: number
): Promise<void> => {
  await authFetch.get(
    policyLeaveReviewEndPoints.NUDGE_POLICY_LEAVE_REQUEST_MANAGERS(
      leaveRequestId
    )
  );
};

export const useNudgePolicyLeaveRequestManagers = (
  onSuccess: () => void,
  onError: (messageKey: string) => void
): UseMutationResult<void, ErrorResponse, number> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: nudgePolicyLeaveRequestManagers,
    onSuccess: (_data, leaveRequestId) => {
      queryClient.invalidateQueries({
        queryKey: policyLeaveReviewQueryKeys.NUDGE_STATUS(leaveRequestId)
      });
      onSuccess();
    },
    onError: (error: ErrorResponse) => {
      onError(error?.response?.data?.results?.[0]?.messageKey ?? "");
    }
  });
};
