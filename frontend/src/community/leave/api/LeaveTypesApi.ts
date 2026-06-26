import {
  UseQueryResult,
  useMutation,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";

import authFetch from "~community/common/utils/axiosInterceptor";
import {
  LeaveTypesDropDownlistPreProcessor,
  LeaveTypesPreProcessor,
  LeaveTypesWithTogglePreProcessor
} from "~community/leave/actions/LeaveTypePreProcessor";
import { leaveTypeEndPoints } from "~community/leave/api/utils/ApiEndpoints";
import { leaveTypeQueryKeys } from "~community/leave/api/utils/QueryKeys";
import {
  LeaveTypePayloadType,
  LeaveTypeType,
  LeaveTypesWithToggleType
} from "~community/leave/types/AddLeaveTypes";
import { LeaveTypesDropDownlistType } from "~community/leave/types/LeaveEntitlementTypes";
import { LeaveEntitlementDropdownListType } from "~community/leave/types/LeaveTypes";
import { quickSetupQueryKeys } from "~enterprise/common/api/utils/QueryKeys";

const params = {
  filterByInUse: false,
  isCarryForward: false
};

export const useGetLeaveTypes = (
  isEnabled: boolean = true
): UseQueryResult<LeaveTypeType[]> => {
  return useQuery({
    enabled: isEnabled,
    queryKey: [leaveTypeQueryKeys.LEAVE_TYPES(params)],
    queryFn: () =>
      authFetch.get(leaveTypeEndPoints.GET_LEAVE_TYPES, {
        params: params
      }),
    select: (data) => {
      return data?.data?.results ?? [];
    }
  });
};

// TODO: add new resource flow adding entitlements code needs to be refactored once the necessary endpoints are available.
export const useGetPreProcessedLeaveTypes = ({
  preprocessed = false,
  withToggle = false,
  withEmojis = false
}: {
  preprocessed: boolean;
  withToggle: boolean;
  withEmojis: boolean;
}): UseQueryResult<
  | LeaveTypesDropDownlistType[]
  | LeaveEntitlementDropdownListType[]
  | LeaveTypesWithToggleType
  | undefined
> => {
  return useQuery({
    queryKey: [leaveTypeQueryKeys.LEAVE_TYPES(params)],
    queryFn: () =>
      authFetch.get(leaveTypeEndPoints.GET_LEAVE_TYPES, {
        params: params
      }),
    select: (data) => {
      const leaveTypes = data?.data?.results;
      if (withToggle) {
        return LeaveTypesWithTogglePreProcessor(leaveTypes);
      } else if (preprocessed) {
        return LeaveTypesDropDownlistPreProcessor(
          leaveTypes,
          withEmojis
        ) as LeaveTypesDropDownlistType[];
      } else {
        return LeaveTypesPreProcessor(leaveTypes);
      }
    }
  });
};

export const useAddLeaveType = (onSuccess: () => void, onError: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (leaveType: LeaveTypePayloadType) => {
      return authFetch.post(leaveTypeEndPoints.ADD_LEAVE_TYPE, leaveType);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          leaveTypeQueryKeys.LEAVE_TYPES(params),
          quickSetupQueryKeys.QUICK_SETUP_PROGRESS
        ]
      });
      onSuccess();
    },
    onError
  });
};

export const useEditLeaveType = (
  onSuccess: () => void,
  onError: () => void
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      leaveType,
      id
    }: {
      leaveType: LeaveTypePayloadType;
      id: number;
    }) => {
      return authFetch.patch(leaveTypeEndPoints.EDIT_LEAVE_TYPE(id), leaveType);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [leaveTypeQueryKeys.LEAVE_TYPES(params)]
      });
      onSuccess();
    },
    onError
  });
};
