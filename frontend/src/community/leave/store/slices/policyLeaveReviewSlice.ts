import {
  SortKeyTypes,
  SortOrderTypes
} from "~community/common/types/CommonTypes";
import { SetType } from "~community/common/types/storeTypes";
import { MANAGER_LEAVE_REQUESTS_PER_PAGE } from "~community/leave/constants/stringConstants";
import {
  PolicyLeaveReviewRequestParams,
  PolicyLeaveReviewSliceType
} from "~community/leave/types/PolicyLeaveReviewTypes";
import { PolicyLeaveRequestStatus } from "~community/leave/types/PolicyLeaveTypes";

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

export const policyLeaveReviewSlice = (
  set: SetType<PolicyLeaveReviewSliceType>
): PolicyLeaveReviewSliceType => ({
  isManagerModalOpen: false,
  isEmployeeModalOpen: false,
  selectedRequestId: null,
  reviewRequestParams: initialPolicyLeaveReviewRequestParams,

  openManagerModal: (selectedRequestId) =>
    set({ selectedRequestId, isManagerModalOpen: true }),
  closeManagerModal: () =>
    set({ selectedRequestId: null, isManagerModalOpen: false }),
  openEmployeeModal: (selectedRequestId) =>
    set({ selectedRequestId, isEmployeeModalOpen: true }),
  closeEmployeeModal: () =>
    set({ selectedRequestId: null, isEmployeeModalOpen: false }),
  setReviewRequestPage: (page) =>
    set((state) => ({
      reviewRequestParams: { ...state.reviewRequestParams, page }
    })),
  setReviewRequestSortKey: (sortKey, sortOrder) =>
    set((state) => ({
      reviewRequestParams: {
        ...state.reviewRequestParams,
        sortKey,
        sortOrder,
        page: 0
      }
    })),
  setReviewRequestStatusFilter: (status) =>
    set((state) => ({
      reviewRequestParams: { ...state.reviewRequestParams, status, page: 0 }
    })),
  setReviewRequestFilters: ({ status, leaveTypeId }) =>
    set((state) => ({
      reviewRequestParams: {
        ...state.reviewRequestParams,
        status,
        leaveTypeId,
        page: 0
      }
    })),
  setReviewRequestDateRange: (startDate, endDate) =>
    set((state) => ({
      reviewRequestParams: {
        ...state.reviewRequestParams,
        startDate,
        endDate,
        page: 0
      }
    })),
  resetReviewRequestFilters: () =>
    set((state) => ({
      reviewRequestParams: {
        ...state.reviewRequestParams,
        status: [],
        leaveTypeId: [],
        page: 0
      }
    }))
});
