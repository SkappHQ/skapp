import { ALL_LOCATIONS_ID } from "~community/common/constants/workLocationConstants";
import { SetType, SortOrderTypes } from "~community/common/types/CommonTypes";
import { HolidayDataFiltersSliceTypes } from "~community/people/types/SliceTypes";

const holidayDataFiltersSlice = (
  set: SetType<HolidayDataFiltersSliceTypes>
): HolidayDataFiltersSliceTypes => ({
  holidayDataFilter: { type: [], color: [], duration: [] },
  holidayDataParams: {
    page: 0,
    sortOrder: SortOrderTypes.ASC,
    isPagination: true,
    holidayTypes: "",
    colors: "",
    holidayDurations: ""
  },
  individualDeleteId: 0,
  selectedDeleteIds: [],
  selectedYear: "2024",
  selectedWorkLocationId: ALL_LOCATIONS_ID,

  handleHolidayDataSort: (key: string, value: string) => {
    set((state: HolidayDataFiltersSliceTypes) => ({
      ...state,
      holidayDataParams: {
        ...state.holidayDataParams,
        page: 0,
        [key]: value
      }
    }));
  },

  setHolidayDataFilter: (key: string, value: string[] | string) => {
    set((state: HolidayDataFiltersSliceTypes) => ({
      ...state,
      holidayDataFilter: {
        ...state.holidayDataFilter,
        [key]: value
      }
    }));
  },

  resetHolidayDataParams: () => {
    set((state: HolidayDataFiltersSliceTypes) => ({
      holidayDataFilter: {
        type: [] as string[],
        color: [] as string[],
        duration: [] as string[]
      },
      holidayDataParams: {
        ...state.holidayDataParams,
        sortOrder: SortOrderTypes.ASC,
        holidayTypes: "",
        colors: "",
        holidayDurations: "",
        page: 0
      }
    }));
  },

  setHolidayDataParams: (key: string, value: string[]) => {
    let types: string = "";
    for (const element of value) {
      const item: string = element.toString();
      const type: string = item + ",";
      types = types + type;
    }
    set((state: HolidayDataFiltersSliceTypes) => ({
      ...state,
      holidayDataParams: {
        ...state.holidayDataParams,
        page: 0,
        [key]: types
      }
    }));
  },

  setHolidayDataPagination: (page: number) => {
    set((state: HolidayDataFiltersSliceTypes) => ({
      ...state,
      holidayDataParams: {
        ...state.holidayDataParams,
        page
      }
    }));
  },

  setIndividualDeleteId: (holidayId: number) => {
    set((state: HolidayDataFiltersSliceTypes) => ({
      ...state,
      individualDeleteId: holidayId
    }));
  },

  setSelectedDeleteIds: (holidayIds: number[]) => {
    set((state: HolidayDataFiltersSliceTypes) => ({
      ...state,
      selectedDeleteIds: holidayIds
    }));
  },
  setSelectedYear: (selectedYear: string) => {
    set((state: HolidayDataFiltersSliceTypes) => ({
      ...state,
      selectedYear: selectedYear
    }));
  },
  setSelectedWorkLocationId: (selectedWorkLocationId: number) => {
    set((state: HolidayDataFiltersSliceTypes) => ({
      ...state,
      selectedWorkLocationId
    }));
  }
});

export default holidayDataFiltersSlice;
