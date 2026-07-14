import {
  UseMutationResult,
  UseQueryResult,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";
import { AxiosError } from "axios";

import authFetch from "~community/common/utils/axiosInterceptor";
import { leavePolicyEndPoints } from "~community/leave/api/utils/ApiEndpoints";
import { leavePolicyQueryKeys } from "~community/leave/api/utils/QueryKeys";
import {
  AddLeavePolicyPayload,
  LeavePoliciesPage,
  PolicyLeaveTypeType,
  UpdateLeavePolicyPayload
} from "~community/leave/types/LeavePolicyTypes";

export const useGetPolicyLeaveTypes = (): UseQueryResult<
  PolicyLeaveTypeType[]
> => {
  return useQuery({
    queryKey: leavePolicyQueryKeys.POLICY_LEAVE_TYPES(),
    queryFn: () => authFetch.get(leavePolicyEndPoints.GET_POLICY_LEAVE_TYPES),
    select: (data) => data?.data?.results ?? []
  });
};

export const useGetLeavePoliciesInfinite = (
  searchKeyword: string,
  leaveTypeId: string,
  size: number
) => {
  return useInfiniteQuery({
    queryKey: leavePolicyQueryKeys.LEAVE_POLICIES_INFINITE(
      searchKeyword,
      leaveTypeId,
      size
    ),
    queryFn: async ({ pageParam = 0 }) => {
      const response = await authFetch.get(
        leavePolicyEndPoints.GET_LEAVE_POLICIES(
          searchKeyword,
          leaveTypeId,
          pageParam,
          size
        )
      );
      return response.data.results[0] as LeavePoliciesPage;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (
        lastPage?.currentPage !== undefined &&
        lastPage?.totalPages !== undefined &&
        lastPage?.currentPage < lastPage?.totalPages - 1
      ) {
        return lastPage.currentPage + 1;
      }
      return undefined;
    },
    refetchOnWindowFocus: false
  });
};

export const useAddLeavePolicy = (
  onSuccess: () => void,
  onError: (error: AxiosError) => void
): UseMutationResult<unknown, AxiosError, AddLeavePolicyPayload> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (leavePolicy: AddLeavePolicyPayload) =>
      authFetch.post(leavePolicyEndPoints.ADD_LEAVE_POLICY, leavePolicy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leavePolicyQueryKeys.ALL });
      onSuccess();
    },
    onError
  });
};

export const useUpdateLeavePolicy = (
  onSuccess: () => void,
  onError: (error: AxiosError) => void
): UseMutationResult<
  unknown,
  AxiosError,
  { policyId: number; payload: UpdateLeavePolicyPayload }
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      policyId,
      payload
    }: {
      policyId: number;
      payload: UpdateLeavePolicyPayload;
    }) =>
      authFetch.put(
        leavePolicyEndPoints.UPDATE_LEAVE_POLICY(policyId),
        payload
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leavePolicyQueryKeys.ALL });
      onSuccess();
    },
    onError
  });
};

export const useDeactivateLeavePolicy = (
  onSuccess: () => void,
  onError: (error: AxiosError) => void
): UseMutationResult<unknown, AxiosError, number> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (policyId: number) =>
      authFetch.patch(leavePolicyEndPoints.DEACTIVATE_LEAVE_POLICY(policyId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leavePolicyQueryKeys.ALL });
      onSuccess();
    },
    onError
  });
};
