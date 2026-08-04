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
import { PolicyLeaveModalEnums } from "~community/leave/enums/PolicyLeaveEnums";
import { TeamAvailabilityDataType } from "~community/leave/types/MyRequests";
import {
  EmployeePolicyBalanceType,
  PolicyLeaveAvailabilityType,
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

/**
 * Query params for the policy My Requests table. Filtering is by policy id rather than
 * leave type id, so two policies sharing a leave type stay independently filterable.
 */
export interface PolicyLeaveRequestParams {
  page: number;
  size: number;
  sortKey: SortKeyTypes;
  sortOrder: SortOrderTypes;
  status: PolicyLeaveRequestStatus[];
  policyId: number[];
}

export const initialPolicyLeaveRequestParams: PolicyLeaveRequestParams = {
  page: 0,
  size: 10,
  sortKey: SortKeyTypes.CREATED_DATE,
  sortOrder: SortOrderTypes.DESC,
  status: [],
  policyId: []
};

export interface PolicyLeaveStore {
  modalType: PolicyLeaveModalEnums;
  isModalOpen: boolean;
  selectedYear: string;
  requestParams: PolicyLeaveRequestParams;
  /**
   * The one policy every check in the apply modal is scoped to. Re-set in full on each
   * open so no state leaks from a previously selected policy.
   */
  selectedPolicyBalance: EmployeePolicyBalanceType | null;
  selectedDates: DateTime[];
  selectedMonth: number;
  selectedTeam: TeamNamesType | null;
  selectedDuration: LeaveStates;
  comment: string;
  attachments: FileUploadType[];
  formErrors: PolicyLeaveFormErrors;
  availability: PolicyLeaveAvailabilityType | null;
  teamAvailabilityData: TeamAvailabilityDataType[];

  setModalType: (modalType: PolicyLeaveModalEnums) => void;
  setSelectedYear: (year: string) => void;
  setRequestPage: (page: number) => void;
  setRequestSortKey: (sortKey: SortKeyTypes) => void;
  setRequestFilters: (filters: {
    status: PolicyLeaveRequestStatus[];
    policyId: number[];
  }) => void;
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
  setAvailability: (availability: PolicyLeaveAvailabilityType | null) => void;
  setTeamAvailabilityData: (data: TeamAvailabilityDataType[]) => void;
  resetForm: () => void;
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
  availability: null,
  teamAvailabilityData: []
});

/**
 * Dedicated store for the leave-policy apply flow. Kept separate from the legacy
 * leave store so the two flows cannot contaminate each other's form state.
 */
export const usePolicyLeaveStore = create<PolicyLeaveStore>()(
  devtools(
    (set) => ({
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
          // A year switch must not keep the previous year's page cursor, which may not
          // exist in the new year's result set.
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
      setAvailability: (availability) => set({ availability }),
      setTeamAvailabilityData: (teamAvailabilityData) =>
        set({ teamAvailabilityData }),
      resetForm: () => set((state) => ({ ...state, ...emptyForm() }))
    }),
    { name: "policyLeaveStore" }
  )
);
