import { type LeaveType } from "../types/CustomLeaveAllocationTypes";
import { LeaveTypesDropDownlistType } from "../types/LeaveEntitlementTypes";

export const leaveTypesPreProcessor = (
  data: LeaveType[]
): LeaveTypesDropDownlistType[] => {
  const preProcessedAllLeaveTypes = data?.map((type: LeaveType) => {
    return {
      typeId: type.typeId,
      name: type.name,
      label: type.name,
      value: type.typeId,
      emoji: type.emoji
    };
  });
  return preProcessedAllLeaveTypes;
};
