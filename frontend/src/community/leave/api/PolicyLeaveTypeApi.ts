import {
  UseMutationResult,
  UseQueryResult,
  useMutation,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";
import { AxiosError, AxiosResponse } from "axios";

import authFetch from "~community/common/utils/axiosInterceptor";
import { policyLeaveTypeEndPoints } from "~community/leave/api/utils/ApiEndpoints";
import {
  leavePolicyQueryKeys,
  policyLeaveTypeQueryKeys
} from "~community/leave/api/utils/QueryKeys";
import {
  PolicyLeaveTypeMutationResponse,
  PolicyLeaveTypePayloadType,
  PolicyLeaveTypeSettingsType,
  PolicyLeaveTypeStatusResponse,
  PolicyLeaveTypesPage,
  SearchPolicyLeaveTypesParams,
  SearchPolicyLeaveTypesResponse,
  UpdatePolicyLeaveTypeVariables,
  UseSearchPolicyLeaveTypesArgs
} from "~community/leave/types/PolicyLeaveTypeTypes";

const searchPolicyLeaveTypes = async (
  params: SearchPolicyLeaveTypesParams
): Promise<PolicyLeaveTypesPage> => {
  const response = await authFetch.get<SearchPolicyLeaveTypesResponse>(
    policyLeaveTypeEndPoints.SEARCH_POLICY_LEAVE_TYPES,
    { params }
  );

  return response.data.results[0];
};

export const useSearchPolicyLeaveTypes = ({
  searchKeyword,
  isActive,
  page,
  size
}: UseSearchPolicyLeaveTypesArgs): UseQueryResult<PolicyLeaveTypesPage> => {
  return useQuery({
    queryKey: policyLeaveTypeQueryKeys.SEARCH(
      searchKeyword,
      isActive,
      page,
      size
    ),
    queryFn: () =>
      searchPolicyLeaveTypes({
        searchKeyword: searchKeyword || undefined,
        isActive,
        page,
        size
      })
  });
};

const getPolicyLeaveType = async (
  id: number
): Promise<PolicyLeaveTypeSettingsType> => {
  const response = await authFetch.get<PolicyLeaveTypeMutationResponse>(
    policyLeaveTypeEndPoints.GET_POLICY_LEAVE_TYPE(id)
  );

  return response.data.results[0];
};

export const useGetPolicyLeaveType = (
  id: number,
  isEnabled = true
): UseQueryResult<PolicyLeaveTypeSettingsType> => {
  return useQuery({
    enabled: isEnabled && Boolean(id),
    queryKey: policyLeaveTypeQueryKeys.DETAIL(id),
    queryFn: () => getPolicyLeaveType(id)
  });
};

const addPolicyLeaveType = (
  policyLeaveType: PolicyLeaveTypePayloadType
): Promise<AxiosResponse<PolicyLeaveTypeMutationResponse>> =>
  authFetch.post<PolicyLeaveTypeMutationResponse>(
    policyLeaveTypeEndPoints.ADD_POLICY_LEAVE_TYPE,
    policyLeaveType
  );

export const useAddPolicyLeaveType = (
  onSuccess: () => void,
  onError: (error: AxiosError) => void
): UseMutationResult<
  AxiosResponse<PolicyLeaveTypeMutationResponse>,
  AxiosError,
  PolicyLeaveTypePayloadType
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addPolicyLeaveType,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: policyLeaveTypeQueryKeys.ALL
      });
      queryClient.invalidateQueries({
        queryKey: leavePolicyQueryKeys.POLICY_LEAVE_TYPES
      });
      onSuccess();
    },
    onError
  });
};

const updatePolicyLeaveType = ({
  id,
  payload
}: UpdatePolicyLeaveTypeVariables): Promise<
  AxiosResponse<PolicyLeaveTypeMutationResponse>
> =>
  authFetch.patch<PolicyLeaveTypeMutationResponse>(
    policyLeaveTypeEndPoints.UPDATE_POLICY_LEAVE_TYPE(id),
    payload
  );

export const useUpdatePolicyLeaveType = (
  onSuccess: () => void,
  onError: (error: AxiosError) => void
): UseMutationResult<
  AxiosResponse<PolicyLeaveTypeMutationResponse>,
  AxiosError,
  UpdatePolicyLeaveTypeVariables
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePolicyLeaveType,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: policyLeaveTypeQueryKeys.ALL
      });
      queryClient.invalidateQueries({
        queryKey: leavePolicyQueryKeys.POLICY_LEAVE_TYPES
      });
      onSuccess();
    },
    onError
  });
};

const activatePolicyLeaveType = (
  id: number
): Promise<AxiosResponse<PolicyLeaveTypeStatusResponse>> =>
  authFetch.patch<PolicyLeaveTypeStatusResponse>(
    policyLeaveTypeEndPoints.ACTIVATE_POLICY_LEAVE_TYPE(id)
  );

export const useActivatePolicyLeaveType = (
  onSuccess: () => void,
  onError: (error: AxiosError) => void
): UseMutationResult<
  AxiosResponse<PolicyLeaveTypeStatusResponse>,
  AxiosError,
  number
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: activatePolicyLeaveType,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: policyLeaveTypeQueryKeys.ALL
      });
      queryClient.invalidateQueries({
        queryKey: leavePolicyQueryKeys.POLICY_LEAVE_TYPES
      });
      onSuccess();
    },
    onError
  });
};

const deactivatePolicyLeaveType = (
  id: number
): Promise<AxiosResponse<PolicyLeaveTypeStatusResponse>> =>
  authFetch.patch<PolicyLeaveTypeStatusResponse>(
    policyLeaveTypeEndPoints.DEACTIVATE_POLICY_LEAVE_TYPE(id)
  );

export const useDeactivatePolicyLeaveType = (
  onSuccess: () => void,
  onError: (error: AxiosError) => void
): UseMutationResult<
  AxiosResponse<PolicyLeaveTypeStatusResponse>,
  AxiosError,
  number
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deactivatePolicyLeaveType,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: policyLeaveTypeQueryKeys.ALL
      });
      queryClient.invalidateQueries({
        queryKey: leavePolicyQueryKeys.POLICY_LEAVE_TYPES
      });
      onSuccess();
    },
    onError
  });
};
