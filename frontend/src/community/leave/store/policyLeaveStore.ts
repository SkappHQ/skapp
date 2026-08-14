import { DateTime } from "luxon";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

import {
  FileUploadType,
  LeaveStates,
  SortKeyTypes,
  SortOrderTypes
} from "~community/common/types/CommonTypes";
import { getCurrentMonth } from "~community/common/utils/dateTimeUtils";
import { POLICY_LEAVE_REQUESTS_PER_PAGE } from "~community/leave/constants/stringConstants";
import { PolicyLeaveModalEnums } from "~community/leave/enums/PolicyLeaveEnums";
import { policyLeaveReviewSlice } from "~community/leave/store/slices/policyLeaveReviewSlice";
import { TeamAvailabilityDataType } from "~community/leave/types/MyRequests";
import { PolicyLeaveReviewSliceType } from "~community/leave/types/PolicyLeaveReviewTypes";
import {
  EmployeePolicyBalanceType,
  PolicyLeaveRequestStatus
} from "~community/leave/types/PolicyLeaveTypes";
import { TeamNamesType } from "~community/people/types/TeamTypes";

export interface PolicyLeaveFormErrors {
  selectedDates: string;
  comment: string;
  attachment: string;
}

export const initialPolicyLeaveFormErrors: PolicyLeaveFormErrors = {
  selectedDates: "",
  comment: "",
  attachment: ""
};

export interface PolicyLeaveRequestFilters {
  status: PolicyLeaveRequestStatus[];
  policyId: number[];
}

export interface PolicyLeaveRequestParams extends PolicyLeaveRequestFilters {
  page: number;
  size: number;
  sortKey: SortKeyTypes;
  sortOrder: SortOrderTypes;
}

export const initialPolicyLeaveRequestParams: PolicyLeaveRequestParams = {
  page: 0,
  size: POLICY_LEAVE_REQUESTS_PER_PAGE,
  sortKey: SortKeyTypes.CREATED_DATE,
  sortOrder: SortOrderTypes.DESC,
  status: [],
  policyId: []
};

export interface PolicyLeaveStore extends PolicyLeaveReviewSliceType {
  modalType: PolicyLeaveModalEnums;
  isModalOpen: boolean;
  selectedYear: string;
  requestParams: PolicyLeaveRequestParams;
  selectedPolicyBalance: EmployeePolicyBalanceType | null;
  selectedDates: DateTime[];
  selectedMonth: number;
  selectedTeam: TeamNamesType | null;
  selectedDuration: LeaveStates;
  comment: string;
  attachments: FileUploadType[];
  formErrors: PolicyLeaveFormErrors;
  teamAvailabilityData: TeamAvailabilityDataType[];

  setModalType: (modalType: PolicyLeaveModalEnums) => void;
  setSelectedYear: (year: string) => void;
  setRequestPage: (page: number) => void;
  setRequestSortKey: (sortKey: SortKeyTypes) => void;
  setRequestFilters: (filters: PolicyLeaveRequestFilters) => void;
  resetRequestFilters: () => void;
  openApplyModalForPolicy: (policyBalance: EmployeePolicyBalanceType) => void;
  setSelectedDates: (dates: DateTime[]) => void;
  setSelectedMonth: (month: number) => void;
  setSelectedTeam: (team: TeamNamesType | null) => void;
  setSelectedDuration: (duration: LeaveStates) => void;
  setComment: (comment: string) => void;
  setAttachments: (attachments: FileUploadType[]) => void;
  setFormError: (key: keyof PolicyLeaveFormErrors, value: string) => void;
  setFormErrors: (errors: PolicyLeaveFormErrors) => void;
  setTeamAvailabilityData: (data: TeamAvailabilityDataType[]) => void;
}

const emptyForm = () => ({
  selectedPolicyBalance: null,
  selectedDates: [],
  selectedMonth: getCurrentMonth(),
  selectedTeam: null,
  selectedDuration: LeaveStates.NONE,
  comment: "",
  attachments: [],
  formErrors: initialPolicyLeaveFormErrors,
  teamAvailabilityData: []
});

export const usePolicyLeaveStore = create<PolicyLeaveStore>()(
  devtools(
    (set) => ({
      ...policyLeaveReviewSlice(set),

      modalType: PolicyLeaveModalEnums.NONE,
      isModalOpen: false,
      selectedYear: DateTime.now().year.toString(),
      requestParams: initialPolicyLeaveRequestParams,
      ...emptyForm(),

      setModalType: (modalType) =>
        set((state) => {
          if (modalType === PolicyLeaveModalEnums.NONE) {
            return {
              ...state,
              modalType,
              isModalOpen: false,
              ...emptyForm()
            };
          }
          return { ...state, modalType, isModalOpen: true };
        }),
      setSelectedYear: (selectedYear) =>
        set((state) => ({
          selectedYear,
          requestParams: { ...state.requestParams, page: 0 }
        })),
      setRequestPage: (page) =>
        set((state) => ({ requestParams: { ...state.requestParams, page } })),
      setRequestSortKey: (sortKey) =>
        set((state) => ({
          requestParams: { ...state.requestParams, sortKey, page: 0 }
        })),
      setRequestFilters: ({ status, policyId }) =>
        set((state) => ({
          requestParams: { ...state.requestParams, status, policyId, page: 0 }
        })),
      resetRequestFilters: () =>
        set((state) => ({
          requestParams: {
            ...state.requestParams,
            status: [],
            policyId: [],
            page: 0
          }
        })),
      openApplyModalForPolicy: (policyBalance) =>
        set((state) => ({
          ...state,
          ...emptyForm(),
          selectedPolicyBalance: policyBalance,
          modalType: PolicyLeaveModalEnums.APPLY_POLICY_LEAVE,
          isModalOpen: true
        })),
      setSelectedDates: (selectedDates) => set({ selectedDates }),
      setSelectedMonth: (selectedMonth) => set({ selectedMonth }),
      setSelectedTeam: (selectedTeam) => set({ selectedTeam }),
      setSelectedDuration: (selectedDuration) => set({ selectedDuration }),
      setComment: (comment) => set({ comment }),
      setAttachments: (attachments) => set({ attachments }),
      setFormError: (key, value) =>
        set((state) => ({
          formErrors: { ...state.formErrors, [key]: value }
        })),
      setFormErrors: (formErrors) => set({ formErrors }),
      setTeamAvailabilityData: (teamAvailabilityData) =>
        set({ teamAvailabilityData })
    }),
    {
      name: "policyLeaveStore",
      enabled: process.env.NODE_ENV !== "production"
    }
  )
);
