import {
  type ApiResponse,
  type CSVResponse,
  type FullReportCSVType,
  type GetEmployeeLeaveReportPreProcessedType,
  type LeaveEntitlements,
  type leaveEntitlementReportDtosType,
  type processedLeaveEntitlementType
} from "../types/LeaveReportTypes";

const processLeaveEntitlements = (
  leaveEntitlements?: processedLeaveEntitlementType[],
  filterIds?: string[]
): leaveEntitlementReportDtosType[] => {
  return (
    filterIds?.map((filterId) => {
      const matchingEntitlement = leaveEntitlements?.find(
        (entitlement) => entitlement.leaveTypeId === parseInt(filterId, 10)
      );

      if (matchingEntitlement) {
        const { leaveTypeId, totalDaysAllocated, totalBalanceDays } =
          matchingEntitlement;
        if (totalDaysAllocated === 0 && totalBalanceDays === 0) {
          return {
            leaveTypeId,
            allocation: "-"
          };
        } else {
          return {
            leaveTypeId,
            allocation: `${totalBalanceDays}/${totalDaysAllocated}`
          };
        }
      } else {
        return {
          leaveTypeId: parseInt(filterId, 10),
          allocation: "-"
        };
      }
    }) || []
  );
};

const processLeaveEntitlementsCSV = (
  leaveEntitlements?: processedLeaveEntitlementType[],
  leaveNames?: string[]
): processedLeaveEntitlementType[] => {
  return (
    leaveNames?.map((leave) => {
      const matchingEntitlement = leaveEntitlements?.find(
        (entitlement) => entitlement.leaveName === leave
      );

      if (matchingEntitlement) {
        const { leaveName, totalDaysAllocated, totalBalanceDays } =
          matchingEntitlement;
        return {
          leaveName,
          totalBalanceDays,
          totalDaysAllocated
        };
      } else {
        return {
          leaveName: leave,
          totalBalanceDays: 0,
          totalDaysAllocated: 0
        };
      }
    }) || []
  );
};

export const employeeLeaveReportPreProcessor = (
  data: ApiResponse,
  filterIds: string[]
): GetEmployeeLeaveReportPreProcessedType => {
  const preProcessedData = data?.items?.map((item: LeaveEntitlements) => {
    const processedLeaveEntitlements = processLeaveEntitlements(
      item.leaveEntitlementReportDtos,
      filterIds
    );

    const sortedLeaveEntitlements = processedLeaveEntitlements.sort(
      (a, b) => a.leaveTypeId - b.leaveTypeId
    );

    return {
      ...item,
      leaveEntitlementReportDtos: sortedLeaveEntitlements
    };
  });

  return {
    items: preProcessedData,
    currentPage: data?.currentPage,
    totalItems: data?.totalItems,
    totalPages: data?.totalPages
  };
};

export const fullReportPreProcessor = (
  data: CSVResponse,
  headerLabels: string[]
): FullReportCSVType => {
  // Leave Entitlements
  const processedLeaveEntitlements =
    data?.employeeEntitlementTeamJobRoleDto?.map((item) => {
      const processedLeaveEntitlement = processLeaveEntitlementsCSV(
        item.employeeLeaveEntitlementsDtos,
        headerLabels
      );

      const sortedLeaveEntitlements = processedLeaveEntitlement.sort((a, b) =>
        (a.leaveName ?? "").localeCompare(b.leaveName ?? "")
      );

      sortedLeaveEntitlements.forEach((item) => {
        delete item.leaveName;
      });

      const { employeeName, teams, jobFamily } = item;
      return {
        employeeName,
        teams,
        jobFamily,
        leaveEntitlementReportDtos: sortedLeaveEntitlements
      };
    });

  // Leave Requests
  const processedLeaveRequests =
    data?.employeeLeaveRequestTeamJobRoleReports?.map((item) => {
      const {
        employeeName,
        teams,
        jobFamily,
        leavePeriod,
        durationDays,
        leaveType,
        dateRequested,
        status,
        reason
      } = item;
      return {
        employeeName,
        teams,
        jobFamily,
        leavePeriod,
        durationDays,
        leaveType,
        dateRequested,
        status,
        reason
      };
    });

  // Custom Allocation
  const processedCustomAllocation =
    data?.employeeCustomEntitlementTeamJobRoles?.map((item) => {
      const {
        employeeName,
        teams,
        jobFamily,
        leaveType,
        days,
        startDate,
        endDate
      } = item;
      return {
        employeeName,
        teams,
        jobFamily,
        leaveType,
        days,
        startDate,
        endDate
      };
    });

  return {
    employeeCustomEntitlementTeamJobRoles: processedCustomAllocation,
    employeeLeaveEntitlementTeamJobRoles: processedLeaveEntitlements,
    employeeLeaveRequestTeamJobRoleReports: processedLeaveRequests
  };
};
