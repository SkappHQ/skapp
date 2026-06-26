import { DateTime } from "luxon";

import {
  FileUploadType,
  LeaveStates,
  SetType
} from "~community/common/types/CommonTypes";
import { getCurrentMonth } from "~community/common/utils/dateTimeUtils";
import { LeaveDurationTypes } from "~community/leave/enums/LeaveTypeEnums";
import { MyRequestModalEnums } from "~community/leave/enums/MyRequestEnums";
import {
  LeaveAllocationDataTypes,
  TeamAvailabilityDataType
} from "~community/leave/types/MyRequests";
import { MyRequestSliceType } from "~community/leave/types/SliceTypes";
import { TeamNamesType } from "~community/people/types/TeamTypes";

export const initialLeaveAllocationData: LeaveAllocationDataTypes = {
  entitlementId: 0,
  leaveType: {
    typeId: 0,
    name: "",
    emojiCode: "",
    colorCode: "",
    calculationType: "",
    leaveDuration: LeaveDurationTypes.NONE,
    maxCarryForwardDays: 0,
    carryForwardExpirationDays: 0,
    carryForwardExpirationDate: null,
    isAttachment: false,
    isOverridden: false,
    isAttachmentMandatory: false,
    isCommentMandatory: false,
    isAutoApproval: false,
    isActive: false,
    isCarryForwardEnabled: false,
    isCarryForwardRemainingBalanceEnabled: false
  },
  validFrom: "",
  validTo: "",
  isActive: false,
  totalDaysAllocated: 0,
  totalDaysUsed: 0,
  balanceInDays: 0,
  reason: null,
  isManual: null,
  isOverride: null,
  employee: null
};

export const initialFormErrors = {
  selectedDates: "",
  comment: "",
  attachment: ""
};

export const myRequestSlice = (
  set: SetType<MyRequestSliceType>
): MyRequestSliceType => ({
  isMyRequestModalOpen: false,
  myRequestModalType: MyRequestModalEnums.NONE,
  selectedLeaveAllocationData: initialLeaveAllocationData,
  teamAvailabilityData: [],
  selectedDates: [],
  selectedMonth: getCurrentMonth(),
  selectedTeam: null,
  selectedDuration: LeaveStates.NONE,
  attachments: [],
  comment: "",
  formErrors: initialFormErrors,
  leaveRequestId: 0,
  isApplyLeaveModalBtnDisabled: false,

  setIsMyRequestModalOpen: (status: boolean) =>
    set((state: MyRequestSliceType) => ({
      ...state,
      isMyRequestModalOpen: status
    })),
  setMyLeaveRequestModalType: (status: MyRequestModalEnums) =>
    set((state: MyRequestSliceType) => {
      if (status === MyRequestModalEnums.NONE) {
        return {
          ...state,
          isMyRequestModalOpen: false,
          myRequestModalType: status,
          teamAvailabilityData: [],
          selectedLeaveAllocationData: initialLeaveAllocationData,
          selectedDates: [],
          selectedMonth: getCurrentMonth(),
          selectedTeam: null,
          selectedDuration: LeaveStates.NONE,
          attachments: [],
          formErrors: initialFormErrors,
          comment: ""
        };
      }

      return {
        ...state,
        isMyRequestModalOpen: true,
        myRequestModalType: status
      };
    }),
  setSelectedLeaveAllocationData: (data: LeaveAllocationDataTypes) => {
    set((state: MyRequestSliceType) => ({
      ...state,
      selectedLeaveAllocationData: data
    }));
  },
  setTeamAvailabilityData: (data: TeamAvailabilityDataType[]) =>
    set((state: MyRequestSliceType) => ({
      ...state,
      teamAvailabilityData: data
    })),
  setSelectedDates: (date: DateTime[]) =>
    set((state: MyRequestSliceType) => ({
      ...state,
      selectedDates: date
    })),
  setSelectedMonth: (month: number) =>
    set((state: MyRequestSliceType) => ({
      ...state,
      selectedMonth: month
    })),
  setSelectedTeam: (team: TeamNamesType | null) =>
    set((state: MyRequestSliceType) => ({
      ...state,
      selectedTeam: team
    })),
  setSelectedDuration: (duration: LeaveStates) =>
    set((state: MyRequestSliceType) => ({
      ...state,
      selectedDuration: duration
    })),
  setComment: (comment: string) =>
    set((state: MyRequestSliceType) => ({
      ...state,
      comment
    })),
  setAttachments: (attachments: FileUploadType[]) =>
    set((state: MyRequestSliceType) => ({
      ...state,
      attachments
    })),
  setFormErrors: (key: string, value: string) =>
    set((state: MyRequestSliceType) => ({
      ...state,
      formErrors: {
        ...state.formErrors,
        [key]: value
      }
    })),
  setLeaveRequestId: (leaveRequestId: number) =>
    set((state: MyRequestSliceType) => ({
      ...state,
      leaveRequestId: leaveRequestId
    })),
  setIsApplyLeaveModalBtnDisabled: (value: boolean) =>
    set((state: MyRequestSliceType) => ({
      ...state,
      isApplyLeaveModalBtnDisabled: value
    }))
});
