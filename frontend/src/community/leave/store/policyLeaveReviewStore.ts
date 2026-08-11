import { create } from "zustand";
import { devtools } from "zustand/middleware";

import {
  SortKeyTypes,
  SortOrderTypes
} from "~community/common/types/CommonTypes";
import { MANAGER_LEAVE_REQUESTS_PER_PAGE } from "~community/leave/constants/stringConstants";
import { PolicyLeaveRequestStatus } from "~community/leave/types/PolicyLeaveTypes";

export interface PolicyLeaveReviewFilters {
  status: PolicyLeaveRequestStatus[];
  leaveTypeId: number[];
}

export interface PolicyLeaveReviewRequestParams extends PolicyLeaveReviewFilters {
  page: number;
  size: number;
  sortKey: SortKeyTypes;
  sortOrder: SortOrderTypes;
  startDate?: string;
  endDate?: string;
}

export const initialPolicyLeaveReviewRequestParams: PolicyLeaveReviewRequestParams =
  {
    page: 0,
    size: MANAGER_LEAVE_REQUESTS_PER_PAGE,
    sortKey: SortKeyTypes.CREATED_DATE,
    sortOrder: SortOrderTypes.DESC,
    status: [PolicyLeaveRequestStatus.PENDING],
    leaveTypeId: [],
    startDate: undefined,
    endDate: undefined
  };

export interface PolicyLeaveReviewStore {
  isManagerModalOpen: boolean;
  isEmployeeModalOpen: boolean;
  selectedRequestId: number | null;
  requestParams: PolicyLeaveReviewRequestParams;

  openManagerModal: (leaveRequestId: number) => void;
  closeManagerModal: () => void;
  openEmployeeModal: (leaveRequestId: number) => void;
  closeEmployeeModal: () => void;
  setRequestPage: (page: number) => void;
  setRequestSortKey: (sortKey: SortKeyTypes) => void;
  setRequestStatusFilter: (status: PolicyLeaveRequestStatus[]) => void;
  setRequestFilters: (filters: PolicyLeaveReviewFilters) => void;
  setRequestDateRange: (startDate?: string, endDate?: string) => void;
  resetRequestFilters: () => void;
}

export const usePolicyLeaveReviewStore = create<PolicyLeaveReviewStore>()(
  devtools(
    (set) => ({
      isManagerModalOpen: false,
      isEmployeeModalOpen: false,
      selectedRequestId: null,
      requestParams: initialPolicyLeaveReviewRequestParams,

      openManagerModal: (selectedRequestId) =>
        set({ selectedRequestId, isManagerModalOpen: true }),
      closeManagerModal: () =>
        set({ selectedRequestId: null, isManagerModalOpen: false }),
      openEmployeeModal: (selectedRequestId) =>
        set({ selectedRequestId, isEmployeeModalOpen: true }),
      closeEmployeeModal: () =>
        set({ selectedRequestId: null, isEmployeeModalOpen: false }),
      setRequestPage: (page) =>
        set((state) => ({ requestParams: { ...state.requestParams, page } })),
      setRequestSortKey: (sortKey) =>
        set((state) => ({
          requestParams: { ...state.requestParams, sortKey, page: 0 }
        })),
      setRequestStatusFilter: (status) =>
        set((state) => ({
          requestParams: { ...state.requestParams, status, page: 0 }
        })),
      setRequestFilters: ({ status, leaveTypeId }) =>
        set((state) => ({
          requestParams: {
            ...state.requestParams,
            status,
            leaveTypeId,
            page: 0
          }
        })),
      setRequestDateRange: (startDate, endDate) =>
        set((state) => ({
          requestParams: { ...state.requestParams, startDate, endDate, page: 0 }
        })),
      resetRequestFilters: () =>
        set((state) => ({
          requestParams: {
            ...state.requestParams,
            status: [],
            leaveTypeId: [],
            startDate: undefined,
            endDate: undefined,
            page: 0
          }
        }))
    }),
    {
      name: "policyLeaveReviewStore",
      enabled: process.env.NODE_ENV !== "production"
    }
  )
);
