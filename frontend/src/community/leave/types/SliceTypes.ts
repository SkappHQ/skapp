import { LeaveStore } from "./StoreTypes";

export interface LeaveAllocationModalSliceType
  extends Pick<
    LeaveStore,
    | "isLeaveAllocationModalOpen"
    | "customLeaveAllocationModalType"
    | "currentEditingLeaveAllocation"
    | "currentDeletingLeaveAllocation"
    | "leaveDays"
    | "leaveType"
    | "effectiveDate"
    | "expirationDate"
    | "currentPage"
    | "customLeaveAllocations"
    | "setIsLeaveAllocationModalOpen"
    | "setCustomLeaveAllocationModalType"
    | "setCurrentEditingLeaveAllocation"
    | "setCurrentDeletingLeaveAllocation"
    | "setLeaveDays"
    | "setLeaveType"
    | "setEffectiveDate"
    | "setExpirationDate"
    | "setCurrentPage"
    | "setCustomLeaveAllocations"
  > {}

export interface LeaveTypeSliceType
  extends Pick<
    LeaveStore,
    | "allLeaveTypes"
    | "pendingNavigation"
    | "isLeaveTypeModalOpen"
    | "leaveTypeModalType"
    | "editingLeaveType"
    | "isLeaveTypeFormDirty"
    | "setAllLeaveTypes"
    | "setPendingNavigation"
    | "setIsLeaveTypeModalOpen"
    | "setLeaveTypeModalType"
    | "setEditingLeaveType"
    | "setLeaveTypeFormDirty"
    | "resetEditingLeaveType"
  > {}

export interface LeaveEntitlementSliceType
  extends Pick<
    LeaveStore,
    | "isLeaveEntitlementModalOpen"
    | "leaveEntitlementModalType"
    | "setLeaveEntitlementModalType"
    | "setIsLeaveEntitlementModalOpen"
    | "setLeaveEntitlementTableSelectedYear"
    | "leaveEntitlementTableSelectedYear"
    | "selectedYear"
    | "setSelectedYear"
    | "page"
    | "setPage"
  > {}
export interface LeaveCarryForwardModalSliceType
  extends Pick<
    LeaveStore,
    | "isLeaveCarryForwardModalOpen"
    | "leaveCarryForwardModalType"
    | "leaveCarryForwardSyncBtnStatus"
    | "setIsLeaveCarryForwardModalOpen"
    | "setLeaveCarryForwardModalType"
    | "setLeaveCarryForwardSyncBtnStatus"
  > {}

export interface NewPendingLeaveCountSliceType
  extends Pick<
    LeaveStore,
    | "viewedPendingLeaveCount"
    | "pendingLeaveCount"
    | "setViewedPendingLeaveCount"
    | "setPendingLeaveCount"
  > {}

export interface addNewEntitlementsSliceType
  extends Pick<
    LeaveStore,
    | "leaveTypes"
    | "setLeaveTypes"
    | "carryForwardLeaveTypes"
    | "setCarryForwardLeaveTypes"
    | "leaveCarryForwardId"
    | "setLeaveCarryForwardId"
    | "carryForwardPagination"
    | "setCarryForwardPagination"
    | "leaveCarryForwardModalData"
    | "setLeaveCarryForwardModalData"
  > {}

export interface MyRequestSliceType
  extends Pick<
    LeaveStore,
    | "selectedLeaveAllocationData"
    | "selectedDates"
    | "selectedMonth"
    | "selectedTeam"
    | "comment"
    | "attachments"
    | "formErrors"
    | "selectedDuration"
    | "teamAvailabilityData"
    | "isMyRequestModalOpen"
    | "isApplyLeaveModalBtnDisabled"
    | "myRequestModalType"
    | "setSelectedLeaveAllocationData"
    | "setSelectedDates"
    | "setSelectedMonth"
    | "setSelectedTeam"
    | "setIsMyRequestModalOpen"
    | "setMyLeaveRequestModalType"
    | "setTeamAvailabilityData"
    | "setComment"
    | "setSelectedDuration"
    | "setAttachments"
    | "setFormErrors"
    | "leaveRequestId"
    | "setIsApplyLeaveModalBtnDisabled"
    | "setLeaveRequestId"
  > {}

export interface LeaveRequestFiltersSliceTypes
  extends Pick<
    LeaveStore,
    | "leaveRequestsFilter"
    | "leaveRequestFilterOrder"
    | "leaveRequestParams"
    | "handleLeaveRequestsSort"
    | "setLeaveRequestsFilter"
    | "setLeaveRequestParams"
    | "resetLeaveRequestParams"
    | "setLeaveRequestFilterOrder"
    | "setPagination"
  > {}

export interface LeaveRequestDataSliceTypes
  extends Pick<
    LeaveStore,
    "leaveRequestData" | "setLeaveRequestData" | "removeLeaveRequestRowData"
  > {}

export interface LeaveRequestModalSliceTypes
  extends Pick<
    LeaveStore,
    | "isManagerModalOpen"
    | "isEmployeeModalOpen"
    | "setIsManagerModal"
    | "setIsEmployeeModal"
  > {}

export interface NewLeaveIdSliceTypes
  extends Pick<
    LeaveStore,
    "newLeaveId" | "setNewLeaveId" | "removeNewLeaveId"
  > {}

export interface EmployeeLeaveRequestDataSliceTypes
  extends Pick<
    LeaveStore,
    | "employeeLeaveRequestData"
    | "setEmployeeLeaveRequestData"
    | "removeEmployeeLeaveRequestData"
  > {}

export interface TeamLeaveAnalyticSliceTypes
  extends Pick<
    LeaveStore,
    | "teamLeaveAnalyticSelectedDates"
    | "teamLeaveAnalyticParams"
    | "setTeamLeaveAnalyticsParams"
    | "resetTeamLeaveAnalyticsParams"
    | "setTeamLeaveAnalyticsPagination"
    | "setTeamLeaveAnalyticSelectedDates"
  > {}
