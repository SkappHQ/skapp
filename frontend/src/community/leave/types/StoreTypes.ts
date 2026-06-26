import { DateTime } from "luxon";

import {
  FileUploadType,
  LeaveStates,
  SortKeyTypes,
  SortOrderTypes
} from "~community/common/types/CommonTypes";
import { ReportsFilterTypes } from "~community/common/types/filterTypes";
import { LeaveEntitlementModelTypes } from "~community/leave/enums/LeaveEntitlementEnums";
import { LeaveTypeModalEnums } from "~community/leave/enums/LeaveTypeEnums";
import { MyRequestModalEnums } from "~community/leave/enums/MyRequestEnums";
import { TeamNamesType } from "~community/people/types/TeamTypes";

import { LeaveTypeType } from "./AddLeaveTypes";
import {
  CustomLeaveAllocationModalTypes,
  CustomLeaveAllocationType
} from "./CustomLeaveAllocationTypes";
import { LeaveRequestDataType } from "./EmployeeLeaveRequestTypes";
import {
  LeaveCarryForwardModalTypes,
  carryForwardPaginationType
} from "./LeaveCarryForwardTypes";
import {
  LeaveRequestsFilterType,
  leaveRequestRowDataTypes
} from "./LeaveRequestTypes";
import {
  LeaveAllocationDataTypes,
  TeamAvailabilityDataType
} from "./MyRequests";
import { LeaveRequest } from "./ResourceAvailabilityTypes";

interface actionsTypes {
  // leaveTypeSlice
  setAllLeaveTypes: (leaveTypes: LeaveTypeType[]) => void;
  setIsLeaveTypeModalOpen: (status: boolean) => void;
  setEditingLeaveType: (leaveType: LeaveTypeType) => void;
  setLeaveTypeModalType: (value: LeaveTypeModalEnums) => void;
  setLeaveTypeFormDirty: (value: boolean) => void;
  resetEditingLeaveType: () => void;
  setPendingNavigation: (value: string) => void;

  //leaveAllocationSlice
  setIsLeaveAllocationModalOpen: (isOpen: boolean) => void;
  setCustomLeaveAllocationModalType: (
    type: CustomLeaveAllocationModalTypes
  ) => void;
  setCurrentEditingLeaveAllocation: (
    leaveAllocation: CustomLeaveAllocationType | undefined
  ) => void;
  setCurrentDeletingLeaveAllocation: (
    leaveAllocation: CustomLeaveAllocationType | undefined
  ) => void;
  setLeaveDays: (days: number) => void;
  setLeaveType: (type: string) => void;
  setEffectiveDate: (date: Date | undefined) => void;
  setExpirationDate: (date: Date | undefined) => void;
  setCurrentPage: (page: number) => void;
  setCustomLeaveAllocations: (allocations: CustomLeaveAllocationType[]) => void;

  //leaveEntitlementSlice
  setIsLeaveEntitlementModalOpen: (status: boolean) => void;
  setLeaveEntitlementModalType: (value: LeaveEntitlementModelTypes) => void;
  setSelectedYear: (value: string) => void;
  setLeaveEntitlementTableSelectedYear: (value: string) => void;
  setLeaveTypes: (value: LeaveTypeType[]) => void;
  setCarryForwardLeaveTypes: (value: LeaveTypeType[]) => void;
  setLeaveCarryForwardId: (value: number[]) => void;
  setCarryForwardPagination: (page: number) => void;
  setPage: (value: number) => void;
  setLeaveCarryForwardModalData: (leaveCarryForwardId: number[]) => void;

  //leaveCarryForwardModalSlice
  setLeaveCarryForwardModalType: (value: LeaveCarryForwardModalTypes) => void;
  setIsLeaveCarryForwardModalOpen: (status: boolean) => void;
  setLeaveCarryForwardSyncBtnStatus: (key: string, value: boolean) => void;

  //myRequestSlice
  setIsMyRequestModalOpen: (status: boolean) => void;
  setMyLeaveRequestModalType: (value: MyRequestModalEnums) => void;
  setSelectedLeaveAllocationData: (data: LeaveAllocationDataTypes) => void;
  setSelectedDates: (dates: DateTime[]) => void;
  setSelectedMonth: (month: number) => void;
  setSelectedTeam: (team: TeamNamesType | null) => void;
  setTeamAvailabilityData: (data: TeamAvailabilityDataType[]) => void;
  setComment: (value: string) => void;
  setSelectedDuration: (value: LeaveStates) => void;
  setAttachments: (value: FileUploadType[]) => void;
  setFormErrors: (key: string, value: string) => void;
  setLeaveRequestId: (leaveRequestId: number) => void;
  setIsApplyLeaveModalBtnDisabled: (value: boolean) => void;

  //LeaveRequestFiltersSliceTypes
  handleLeaveRequestsSort: (key: string, value: string) => void;
  setLeaveRequestsFilter: (key: string, value: string[] | string) => void;
  setLeaveRequestParams: (key: string, value: string | string[]) => void;
  resetLeaveRequestParams: () => void;
  setLeaveRequestFilterOrder: (value: string[]) => void;
  setPagination: (value: number) => void;

  setLeaveRequestData: (value: leaveRequestRowDataTypes) => void;
  removeLeaveRequestRowData: () => void;
  setIsManagerModal: (value: boolean) => void;
  setIsEmployeeModal: (value: boolean) => void;
  setNewLeaveId: (value: number) => void;
  removeNewLeaveId: () => void;

  //OnLeaveModal
  setIsOnLeaveModalOpen: (value: boolean) => void;
  setOnLeaveModalTitle: (value: string) => void;
  setTodaysAvailability: (value: LeaveRequest[]) => void;

  //LeaveReportSlice
  setReportsParams: (key: string, value: any) => void;
  setReportsFilter: (key: string, value: string[] | string) => void;
  setReportsFilterOrder: (value: string[]) => void;
  setReportsFilterOrderIds: (value: string[]) => void;
  setReportsPagination: (value: any) => void;
  resetReportsParams: () => void;
  resetReportsFilter: () => void;
  resetReportsFilterOrder: () => void;
  resetReportsFilterOrderIds: () => void;

  //EmployeeLeaveRequestDataSlice
  setEmployeeLeaveRequestData: (value: LeaveRequestDataType) => void;
  removeEmployeeLeaveRequestData: () => void;

  //TeamLeaveAnalyticSlice
  setTeamLeaveAnalyticSelectedDates: (value: string[]) => void;
  setTeamLeaveAnalyticsParams: (key: string, value: string | string[]) => void;
  resetTeamLeaveAnalyticsParams: () => void;
  setTeamLeaveAnalyticsPagination: (value: number) => void;

  //NewPendingLeaveCountSlice
  setViewedPendingLeaveCount: (count: number) => void;
  setPendingLeaveCount: (count: number) => void;
}

export interface LeaveStore extends actionsTypes {
  // leaveTypeSlice
  allLeaveTypes: LeaveTypeType[];
  isLeaveTypeModalOpen: boolean;
  leaveTypeModalType: LeaveTypeModalEnums;
  editingLeaveType: LeaveTypeType;
  isLeaveTypeFormDirty: boolean;
  pendingNavigation: string;

  //leaveAllocationSlice
  isLeaveAllocationModalOpen: boolean;
  customLeaveAllocationModalType: CustomLeaveAllocationModalTypes;
  currentEditingLeaveAllocation?: CustomLeaveAllocationType;
  currentDeletingLeaveAllocation: CustomLeaveAllocationType | undefined;
  leaveDays: number;
  leaveType: string;
  effectiveDate?: Date;
  expirationDate?: Date;
  currentPage: number;
  customLeaveAllocations: CustomLeaveAllocationType[];

  //leaveEntitlementSlice
  isLeaveEntitlementModalOpen: boolean;
  leaveEntitlementModalType: LeaveEntitlementModelTypes;
  selectedYear: string;
  leaveEntitlementTableSelectedYear: string;
  leaveTypes: LeaveTypeType[];
  carryForwardLeaveTypes: LeaveTypeType[];
  leaveCarryForwardId: number[];
  carryForwardPagination: carryForwardPaginationType;
  page: number;
  leaveCarryForwardModalData: {
    leaveCarryForwardId: number[] | null;
    carryForwardLeaveTypes: LeaveTypeType[];
  };

  //leaveCarryForwardModalSlice
  isLeaveCarryForwardModalOpen: boolean;
  leaveCarryForwardModalType: LeaveCarryForwardModalTypes;
  leaveCarryForwardSyncBtnStatus: {
    isLoading: boolean;
    isDisabled: boolean;
  };

  //myRequestSlice
  isMyRequestModalOpen: boolean;
  myRequestModalType: MyRequestModalEnums;
  selectedLeaveAllocationData: LeaveAllocationDataTypes;
  selectedDates: DateTime[];
  selectedMonth: number;
  selectedTeam: TeamNamesType | null;
  teamAvailabilityData: TeamAvailabilityDataType[];
  comment: string;
  selectedDuration: LeaveStates;
  attachments: FileUploadType[];
  formErrors: Record<string, string>;
  leaveRequestId: number;
  isApplyLeaveModalBtnDisabled: boolean;

  //LeaveRequestFiltersSliceTypes
  leaveRequestsFilter: LeaveRequestsFilterType;
  leaveRequestParams: {
    status?: string;
    leaveType?: string;
    startDate?: string;
    endDate?: string;
    sortKey?: string;
    page?: number | string;
    size?: string;
    managerType?: string[];
  };
  leaveRequestFilterOrder: string[];

  leaveRequestData: leaveRequestRowDataTypes;
  isManagerModalOpen: boolean;
  isEmployeeModalOpen: boolean;
  newLeaveId: number | null;

  //OnLeaveModal
  isOnLeaveModalOpen: boolean;
  onLeaveModalTitle: string;
  todaysAvailability: LeaveRequest[];

  //LeaveReportSlice
  reportsParams: {
    year: string;
    leaveTypeId: string[];
    jobRoleId: string;
    teamId: string;
    page: number;
    size: number;
    sortKey: string;
    sortOrder: SortKeyTypes;
    isExport: string;
    leaveStatus: string[];
  };
  reportsFilter: ReportsFilterTypes;
  reportsFilterOrder: string[];
  reportsFilterOrderIds: string[];

  //EmployeeLeaveRequestDataSlice
  employeeLeaveRequestData: LeaveRequestDataType;

  //TeamLeaveAnalyticSlice
  teamLeaveAnalyticSelectedDates: string[];
  teamLeaveAnalyticParams: {
    status?: string | null;
    leaveType?: string | null;
    startDate?: string;
    endDate?: string;
    teamMemberIds?: string | null;
    page?: number;
    sortKey?: SortKeyTypes;
    sortOrder?: SortOrderTypes;
    size?: string;
    isExport?: boolean;
  };

  //NewPendingLeaveCountSlice
  viewedPendingLeaveCount: number;
  pendingLeaveCount: number;
}
