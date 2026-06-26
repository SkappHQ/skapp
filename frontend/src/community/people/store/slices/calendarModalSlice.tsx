import {
  type FileUploadType,
  type SetType
} from "~community/common/types/CommonTypes";
import {
  type AddCalenderInputType,
  CalendarSliceTypes
} from "~community/people/types/SliceTypes";

const initialCalenderDetails: AddCalenderInputType = {
  acceptedFile: []
};

export const addNewCalenderModalSlice = (
  set: SetType<CalendarSliceTypes>
): CalendarSliceTypes => ({
  newCalenderDetails: initialCalenderDetails,
  isNewCalendarDetailsValid: false,
  calendarErrors: "",

  setNewCalendarDetails: (value: FileUploadType[]) =>
    set((state: CalendarSliceTypes) => ({
      ...state,
      newCalenderDetails: { ...state.newCalenderDetails, acceptedFile: value }
    })),

  setIsNewCalendarDetailsValid: (value: boolean) => {
    set((state: CalendarSliceTypes) => ({
      ...state,
      isNewCalendarDetailsValid: value
    }));
  },

  setCalendarErrors: (value: string) => {
    set((state: CalendarSliceTypes) => ({
      ...state,
      calendarErrors: value
    }));
  },

  removeAddedCalendarDetails: () =>
    set((state: CalendarSliceTypes) => ({
      ...state,
      newCalenderDetails: initialCalenderDetails,
      isNewCalendarDetailsValid: false,
      calendarErrors: ""
    }))
});
