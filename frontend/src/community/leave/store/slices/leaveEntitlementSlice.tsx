import { SetType } from "~community/common/types/storeTypes";
import { getAdjacentYearsWithCurrent } from "~community/common/utils/dateTimeUtils";
import { LeaveEntitlementModelTypes } from "~community/leave/enums/LeaveEntitlementEnums";
import { LeaveEntitlementSliceType } from "~community/leave/types/SliceTypes";

const yearsList = getAdjacentYearsWithCurrent();

export const leaveEntitlementSlice = (
  set: SetType<LeaveEntitlementSliceType>
): LeaveEntitlementSliceType => ({
  page: 1,
  selectedYear: yearsList[1].value.toString(),
  leaveEntitlementTableSelectedYear: yearsList[1].value.toString(),
  isLeaveEntitlementModalOpen: false,
  leaveEntitlementModalType: LeaveEntitlementModelTypes.NONE,
  setPage: (page: number) => set(() => ({ page })),
  setLeaveEntitlementTableSelectedYear: (year: string) =>
    set(() => ({ leaveEntitlementTableSelectedYear: year })),
  setSelectedYear: (year: string) => set(() => ({ selectedYear: year })),
  setIsLeaveEntitlementModalOpen: (status: boolean) =>
    set(() => ({ isLeaveEntitlementModalOpen: status })),
  setLeaveEntitlementModalType: (modalType: LeaveEntitlementModelTypes) =>
    set((state: LeaveEntitlementSliceType) => {
      if (modalType === LeaveEntitlementModelTypes.NONE) {
        return {
          ...state,
          isLeaveEntitlementModalOpen: false,
          leaveEntitlementModalType: modalType
        };
      }

      return {
        ...state,
        isLeaveEntitlementModalOpen: true,
        leaveEntitlementModalType: modalType
      };
    })
});
