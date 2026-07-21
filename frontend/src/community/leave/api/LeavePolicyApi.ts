import {
  UseMutationResult,
  UseQueryResult,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";
import { AxiosError, AxiosResponse } from "axios";

import authFetch from "~community/common/utils/axiosInterceptor";
import { leavePolicyEndPoints } from "~community/leave/api/utils/ApiEndpoints";
import { leavePolicyQueryKeys } from "~community/leave/api/utils/QueryKeys";
import {
  AddLeavePolicyPayload,
  GetLeavePoliciesInfiniteArgs,
  GetLeavePoliciesParams,
  LeavePoliciesResponse,
  LeavePolicyMutationResponse,
  PolicyLeaveTypeType,
  PolicyLeaveTypesResponse,
  UpdateLeavePolicyVariables
} from "~community/leave/types/LeavePolicyTypes";

export const useGetPolicyLeaveTypes = (): UseQueryResult<
  PolicyLeaveTypeType[]
> => {
  return useQuery({
    queryKey: leavePolicyQueryKeys.POLICY_LEAVE_TYPES(),
    queryFn: async () => {
      const response = await authFetch.get<PolicyLeaveTypesResponse>(
        leavePolicyEndPoints.GET_POLICY_LEAVE_TYPES
      );
      return response.data.results ?? [];
    }
  });
};

export const useGetLeavePoliciesInfinite = ({
  searchKeyword,
  leaveTypeId,
  size
}: GetLeavePoliciesInfiniteArgs) => {
  return useInfiniteQuery({
    queryKey: leavePolicyQueryKeys.LEAVE_POLICIES_INFINITE(
      searchKeyword,
      leaveTypeId,
      size
    ),
    queryFn: async ({ pageParam = 0 }) => {
      const params: GetLeavePoliciesParams = {
        searchKeyword: searchKeyword || undefined,
        leaveTypeId: leaveTypeId || undefined,
        page: pageParam,
        size
      };
      const response = await authFetch.get<LeavePoliciesResponse>(
        leavePolicyEndPoints.GET_LEAVE_POLICIES,
        { params }
      );
      return response.data.results[0];
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
): UseMutationResult<
  AxiosResponse<LeavePolicyMutationResponse>,
  AxiosError,
  AddLeavePolicyPayload
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (leavePolicy: AddLeavePolicyPayload) =>
      authFetch.post<LeavePolicyMutationResponse>(
        leavePolicyEndPoints.ADD_LEAVE_POLICY,
        leavePolicy
      ),
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
  AxiosResponse<LeavePolicyMutationResponse>,
  AxiosError,
  UpdateLeavePolicyVariables
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: UpdateLeavePolicyVariables) =>
      authFetch.put<LeavePolicyMutationResponse>(
        leavePolicyEndPoints.UPDATE_LEAVE_POLICY(id),
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
): UseMutationResult<
  AxiosResponse<LeavePolicyMutationResponse>,
  AxiosError,
  number
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      authFetch.patch<LeavePolicyMutationResponse>(
        leavePolicyEndPoints.DEACTIVATE_LEAVE_POLICY(id)
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leavePolicyQueryKeys.ALL });
      onSuccess();
    },
    onError
  });
};
