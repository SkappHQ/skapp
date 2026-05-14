import { SetType } from "~community/common/types/CommonTypes";
import {
  HolidayDataType,
  HolidayDurationType,
  HolidayHalfDayState
} from "~community/people/types/HolidayTypes";
import { HolidaySliceTypes } from "~community/people/types/SliceTypes";

const newHolidayDetails = {
  holidayDate: "",
  holidayType: "",
  holidayReason: "",
  duration: HolidayDurationType.NONE,
  halfDayState: HolidayHalfDayState.NONE,
  holidayId: 0,
  holidayName: "",
  holidayColor: "",
  workLocations: [] as number[]
};

const initialFailedCount = 0;
const initialSuccessCount = 0;
const initialIsBulkUpload = false;

const holidaySlice = (set: SetType<HolidaySliceTypes>): HolidaySliceTypes => ({
  newHolidayDetails,
  failedCount: initialFailedCount,
  successCount: initialSuccessCount,
  isBulkUpload: initialIsBulkUpload,

  setHolidayDetails: (data: HolidayDataType) => {
    const {
      holidayDate = "",
      holidayType = "",
      holidayReason = "",
      duration = HolidayDurationType.FULLDAY,
      halfDayState = HolidayHalfDayState.EVENING,
      holidayId = 0,
      holidayColor = "",
      workLocations = []
    } = data;
    set((state: HolidaySliceTypes) => ({
      ...state,
      newHolidayDetails: {
        ...state.newHolidayDetails,
        holidayDate,
        holidayType,
        holidayReason,
        duration: duration as HolidayDurationType,
        halfDayState: halfDayState as HolidayHalfDayState,
        holidayId,
        holidayColor,
        workLocations: (workLocations ?? []).map(Number)
      }
    }));
  },

  setFailedCount: (count: number) => {
    set((state: HolidaySliceTypes) => ({
      ...state,
      failedCount: count
    }));
  },

  setSuccessCount: (count: number) => {
    set((state: HolidaySliceTypes) => ({
      ...state,
      successCount: count
    }));
  },

  resetHolidayDetails: () => {
    set({
      newHolidayDetails: {
        ...newHolidayDetails
      }
    });
  },

  resetFailedCount: () => {
    set({
      failedCount: initialFailedCount
    });
  },

  resetSuccessCount: () => {
    set({
      successCount: initialSuccessCount
    });
  },

  setIsBulkUpload: (value: boolean) => {
    set((state: HolidaySliceTypes) => ({
      ...state,
      isBulkUpload: value
    }));
  }
});

export default holidaySlice;
