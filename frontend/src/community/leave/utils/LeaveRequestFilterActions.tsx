import { JSX } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { FilterButtonTypes } from "~community/common/types/CommonTypes";
import { IconName } from "~community/common/types/IconTypes";
import { LeaveTypeType } from "~community/leave/types/AddLeaveTypes";
import {
  LeaveRequestsFilterType,
  LeaveStatusTypes
} from "~community/leave/types/LeaveRequestTypes";

export const setLeaveRequestsParams = (
  leaveRequestFilterValue: LeaveRequestsFilterType,
  setLeaveRequestParams: (key: string, value: string | string[]) => void
) => {
  leaveRequestFilterValue.status &&
    setLeaveRequestParams("status", leaveRequestFilterValue.status);

  leaveRequestFilterValue.type &&
    setLeaveRequestParams("leaveType", leaveRequestFilterValue.type);
};

export const requestedLeaveTypesPreProcessor = (
  data: LeaveTypeType[]
): FilterButtonTypes[] => {
  const preProcessedLeaveTypes = data?.map((type: LeaveTypeType) => {
    return {
      id: type?.typeId?.toString(),
      text: type?.name
    };
  });
  return preProcessedLeaveTypes;
};

export const requestTypeSelector = (status: string): JSX.Element => {
  switch (status) {
    case LeaveStatusTypes.PENDING:
      return <Icon name={IconName.PENDING_STATUS_ICON} />;
    case LeaveStatusTypes.APPROVED:
      return <Icon name={IconName.APPROVED_STATUS_ICON} />;
    case LeaveStatusTypes.DENIED:
      return <Icon name={IconName.DENIED_STATUS_ICON} />;
    case LeaveStatusTypes.CANCELLED:
      return <Icon name={IconName.CANCELLED_STATUS_ICON} />;
    case LeaveStatusTypes.REVOKED:
      return <Icon name={IconName.REVOKED_STATUS_ICON} />;
    default:
      return <></>;
  }
};
