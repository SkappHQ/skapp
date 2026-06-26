import { SetType } from "~community/common/types/storeTypes";
import { holidayModalTypes } from "~community/people/types/HolidayTypes";
import { HolidayModalSliceType } from "~community/people/types/SliceTypes";

export const holidayModalSlice = (
  set: SetType<HolidayModalSliceType>
): HolidayModalSliceType => ({
  isHolidayModalOpen: false,
  holidayModalType: holidayModalTypes.NONE,
  setIsHolidayModalOpen: (status: boolean) =>
    set(() => ({ isHolidayModalOpen: status })),
  setHolidayModalType: (modalType: holidayModalTypes) =>
    set(() => ({ holidayModalType: modalType }))
});
