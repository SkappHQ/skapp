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
  LeavePolicyConfigResponse,
  LeavePolicyConfigResult,
  LeavePolicyMutationResponse,
  PolicyLeaveTypesResponse,
  PolicyLeaveTypesResult,
  UpdateLeavePolicyVariables
} from "~community/leave/types/LeavePolicyTypes";

const getPolicyLeaveTypes = async (): Promise<PolicyLeaveTypesResult> => {
  const response = await authFetch.get<PolicyLeaveTypesResponse>(
    leavePolicyEndPoints.GET_POLICY_LEAVE_TYPES
  );
  return response.data.results[0];
};

export const useGetPolicyLeaveTypes =
  (): UseQueryResult<PolicyLeaveTypesResult> => {
  return useQuery({
    queryKey: leavePolicyQueryKeys.POLICY_LEAVE_TYPES,
    queryFn: getPolicyLeaveTypes
  });
};

const getLeavePolicies = async (params: GetLeavePoliciesParams) => {
  const response = await authFetch.get<LeavePoliciesResponse>(
    leavePolicyEndPoints.GET_LEAVE_POLICIES,
    { params }
  );
  return response.data.results[0];
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
    queryFn: ({ pageParam = 0 }) =>
      getLeavePolicies({
        searchKeyword: searchKeyword || undefined,
        leaveTypeId: leaveTypeId || undefined,
        page: pageParam,
        size
      }),
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

const addLeavePolicy = (
  leavePolicy: AddLeavePolicyPayload
): Promise<AxiosResponse<LeavePolicyMutationResponse>> =>
  authFetch.post<LeavePolicyMutationResponse>(
    leavePolicyEndPoints.ADD_LEAVE_POLICY,
    leavePolicy
  );

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
    mutationFn: addLeavePolicy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leavePolicyQueryKeys.ALL });
      onSuccess();
    },
    onError
  });
};

const updateLeavePolicy = ({
  id,
  payload
}: UpdateLeavePolicyVariables): Promise<
  AxiosResponse<LeavePolicyMutationResponse>
> =>
  authFetch.put<LeavePolicyMutationResponse>(
    leavePolicyEndPoints.UPDATE_LEAVE_POLICY(id),
    payload
  );

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
    mutationFn: updateLeavePolicy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leavePolicyQueryKeys.ALL });
      onSuccess();
    },
    onError
  });
};

const getLeavePolicyConfig = async (): Promise<LeavePolicyConfigResult> => {
  const response = await authFetch.get<LeavePolicyConfigResponse>(
    leavePolicyEndPoints.GET_LEAVE_POLICY_CONFIG
  );
  return response.data.results[0];
};

export const useGetLeavePolicyConfig = (
  enabled = true
): UseQueryResult<LeavePolicyConfigResult> => {
  return useQuery({
    queryKey: leavePolicyQueryKeys.LEAVE_POLICY_CONFIG,
    queryFn: getLeavePolicyConfig,
    enabled,
    refetchOnWindowFocus: false
  });
};

const enableLeavePolicies = (): Promise<
  AxiosResponse<LeavePolicyMutationResponse>
> =>
  authFetch.post<LeavePolicyMutationResponse>(
    leavePolicyEndPoints.ENABLE_LEAVE_POLICIES
  );

export const useEnableLeavePolicies = (
  onSuccess: () => void,
  onError: (error: AxiosError) => void
): UseMutationResult<
  AxiosResponse<LeavePolicyMutationResponse>,
  AxiosError,
  void
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: enableLeavePolicies,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: leavePolicyQueryKeys.LEAVE_POLICY_CONFIG
      });
      onSuccess();
    },
    onError
  });
};

const deactivateLeavePolicy = (
  id: number
): Promise<AxiosResponse<LeavePolicyMutationResponse>> =>
  authFetch.patch<LeavePolicyMutationResponse>(
    leavePolicyEndPoints.DEACTIVATE_LEAVE_POLICY(id)
  );

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
    mutationFn: deactivateLeavePolicy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leavePolicyQueryKeys.ALL });
      onSuccess();
    },
    onError
  });
};

const activateLeavePolicy = (
  id: number
): Promise<AxiosResponse<LeavePolicyMutationResponse>> =>
  authFetch.patch<LeavePolicyMutationResponse>(
    leavePolicyEndPoints.ACTIVATE_LEAVE_POLICY(id)
  );

export const useActivateLeavePolicy = (
  onSuccess: () => void,
  onError: (error: AxiosError) => void
): UseMutationResult<
  AxiosResponse<LeavePolicyMutationResponse>,
  AxiosError,
  number
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: activateLeavePolicy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leavePolicyQueryKeys.ALL });
      onSuccess();
    },
    onError
  });
};
