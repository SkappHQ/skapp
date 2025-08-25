import {
  FilterButtonTypes,
  SortKeyTypes,
  SortOrderTypes
} from "~community/common/types/CommonTypes";
import { MenuitemsDataTypes } from "~community/common/types/filterTypes";
import { SetType } from "~community/common/types/storeTypes";
import { EmploymentStatusTypes } from "~community/people/types/EmployeeTypes";
import { EmployeeDataFiltersSliceType } from "~community/people/types/SliceTypes";

export const employeeDataFiltersSlice = (
  set: SetType<EmployeeDataFiltersSliceType>
): EmployeeDataFiltersSliceType => ({
  employeeDataFilter: {
    employmentTypes: [],
    permission: [],
    team: [],
    role: [],
    accountStatus: [],
    employmentAllocations: [],
    gender: null,
    nationality: [],
    employeeType: []
  },
  employeeDataFilterOrder: [],
  employeeDataParams: {
    sortKey: SortKeyTypes.NAME,
    sortOrder: SortOrderTypes.ASC,
    searchKeyword: "",
    isExport: false,
    accountStatus: EmploymentStatusTypes?.ACTIVE
  },
  menuItems: [],
  searchedItems: [],
  isPendingInvitationListOpen: false,
  selectedEmployees: [],
  setSelectedEmployees: (value: number[]) => {
    set((state: EmployeeDataFiltersSliceType) => ({
      ...state,
      selectedEmployees: value
    }));
  },

  handleEmployeeDataSort: (key: string, value: string | boolean) => {
    set((state: EmployeeDataFiltersSliceType) => ({
      ...state,
      employeeDataParams: {
        ...state.employeeDataParams,
        [key]: value
      }
    }));
  },

  setEmployeeDataFilter: (
    key: string,
    value: string[] | string | number[] | number | FilterButtonTypes[]
  ) => {
    set((state: EmployeeDataFiltersSliceType) => ({
      ...state,
      employeeDataFilter: {
        ...state.employeeDataFilter,
        [key]: value
      }
    }));
  },

  resetEmployeeDataParams: () => {
    set((state: EmployeeDataFiltersSliceType) => ({
      employeeDataFilter: {
        employmentTypes: [] as string[],
        permission: [] as string[],
        team: [],
        role: [],
        accountStatus: [],
        employmentAllocations: [] as string[],
        gender: null,
        nationality: [],
        employeeType: []
      },
      employeeDataFilterOrder: [] as string[],
      employeeDataParams: {
        ...state.employeeDataParams,
        employmentAllocations: "",
        permissions: "",
        team: "",
        role: "",
        searchKeyword: "",
        accountStatus: EmploymentStatusTypes?.ACTIVE,
        employmentTypes: "",
        gender: null
      },
      menuItems: [] as MenuitemsDataTypes[],
      searchedItems: [] as string[]
    }));
  },

  setEmployeeDataParams: (
    key: string,
    value: (string | number)[] | string | boolean
  ) => {
    let types: string = "";

    if (typeof value === "string") {
      types = value;
    } else if (typeof value === "boolean") {
      types = value.toString();
    } else if (Array.isArray(value)) {
      for (const element of value) {
        const item = element?.toString();
        const type: string = item + ",";
        types = types + type;
      }
      types = types.slice(0, -1);
    }

    set((state: EmployeeDataFiltersSliceType) => ({
      ...state,
      employeeDataParams: {
        ...state.employeeDataParams,
        [key]: types
      }
    }));
  },

  setEmployeeDataPagination: (page: number) => {
    set((state: EmployeeDataFiltersSliceType) => ({
      ...state,
      employeeDataParams: {
        ...state.employeeDataParams,
        page
      }
    }));
  },

  setEmployeeDataFilterOrder: (value: string[]) => {
    set((state: EmployeeDataFiltersSliceType) => ({
      ...state,
      employeeDataFilterOrder: value
    }));
  },

  setMenuItems: (value: MenuitemsDataTypes[]) => {
    set((state: EmployeeDataFiltersSliceType) => ({
      ...state,
      menuItems: value
    }));
  },

  setSearchedItems: (value: string[]) => {
    set((state: EmployeeDataFiltersSliceType) => ({
      ...state,
      searchedItems: value
    }));
  },

  setEmployeeStatusParam: (value: boolean | string) => {
    set((state: EmployeeDataFiltersSliceType) => ({
      ...state,
      employeeDataParams: {
        ...state.employeeDataParams,
        isDeactivated: value
      }
    }));
  },

  setIsEmployeePending: (value: boolean | string) => {
    set((state: EmployeeDataFiltersSliceType) => ({
      ...state,
      employeeDataParams: {
        ...state.employeeDataParams,
        isPending: value
      }
    }));
  },

  setSearchKeyword: (value: string) => {
    set((state: EmployeeDataFiltersSliceType) => ({
      ...state,
      employeeDataParams: {
        ...state.employeeDataParams,
        searchKeyword: value
      }
    }));
  },

  setIsPendingInvitationListOpen: (value: boolean) => {
    set((state: EmployeeDataFiltersSliceType) => ({
      ...state,
      isPendingInvitationListOpen: value
    }));
  },

  removeEmployeeFilter: (label?: string) => {
    set((state: EmployeeDataFiltersSliceType) => {
      const updatedFilters = { ...state.employeeDataFilter };

      const updatedParams = { ...state.employeeDataParams };

      for (const key in updatedParams) {
        const paramValue = updatedParams[key as keyof typeof updatedParams];

        if (typeof paramValue === "string") {
          if (key === "role" || key === "team") {
            const filterItems = updatedFilters[
              key as keyof typeof updatedFilters
            ] as unknown as FilterButtonTypes;
            if (Array.isArray(filterItems)) {
              const matchingItem: FilterButtonTypes | undefined =
                filterItems.find(
                  (item: FilterButtonTypes) =>
                    item.text?.toUpperCase() === label?.toUpperCase()
                );

              if (matchingItem) {
                const matchingId = matchingItem?.id?.toString();

                if (paramValue === matchingId) {
                  updatedParams[key as keyof typeof updatedParams] = undefined;
                }
              }
            }
          }

          if (paramValue?.toUpperCase() === label?.toUpperCase()) {
            if (updatedParams[key as keyof typeof updatedParams]) {
              updatedParams[key as keyof typeof updatedParams] = undefined;
            }
          }
        }
      }

      for (const key in updatedFilters) {
        const filterValue = updatedFilters[key];

        if (Array.isArray(filterValue)) {
          if (key === "team" || key === "role") {
            if (updatedFilters[key]) {
              updatedFilters[key] = filterValue.filter(
                (item: { text: string }) =>
                  item.text?.toUpperCase() !== label?.toUpperCase()
              );
            }
          } else {
            updatedFilters[key] = filterValue.filter(
              (value: string) => value.toUpperCase() !== label?.toUpperCase()
            );
          }
        } else if (typeof filterValue === "string") {
          if (filterValue?.toUpperCase() === label?.toUpperCase()) {
            updatedFilters[key] = undefined;
          }
        }
      }

      return {
        ...state,
        employeeDataFilter: updatedFilters,
        employeeDataParams: updatedParams
      };
    });
  },

  removeGenderFilter: () => {
    set((state: EmployeeDataFiltersSliceType) => ({
      ...state,
      employeeDataFilter: {
        ...state.employeeDataFilter,
        gender: null
      }
    }));
  }
});
