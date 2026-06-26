import { unparse } from "papaparse";

import { SheetType } from "~community/leave/enums/LeaveReportEnums";
import { FullReportCSVType } from "~community/leave/types/LeaveReportTypes";

type DownloadDataAsCSV = (
  data: FullReportCSVType,
  headerLabels: string[],
  sheetType: SheetType
) => void;

export const downloadDataAsCSV: DownloadDataAsCSV = (
  data,
  headerLabels,
  sheetType
) => {
  const downloadCSV = (csvContent: string, filename: string) => {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  switch (sheetType) {
    case SheetType.LeaveAllocation: {
      const headers: string[] = [
        "NAME",
        "TEAM",
        ...headerLabels.flatMap((label) => [
          `${label.toUpperCase()} BALANCE`,
          `${label.toUpperCase()} ENTITLEMENT`
        ])
      ];

      const dataRows: (string | number)[][] =
        data.employeeLeaveEntitlementTeamJobRoles.map((item) => [
          item.employeeName ?? "",
          item.teams ?? "",
          ...item.leaveEntitlementReportDtos.flatMap((dto) => [
            dto.totalBalanceDays ?? 0,
            dto.totalDaysAllocated ?? 0
          ])
        ]);

      const csvContent = unparse({
        fields: headers,
        data: dataRows
      });

      downloadCSV(csvContent, "Leave_Entitlements.csv");
      break;
    }

    case SheetType.LeaveRequests: {
      const headers: string[] = [
        "NAME",
        "TEAM",
        "LEAVE PERIOD",
        "DAYS",
        "LEAVE TYPE",
        "DATE REQUESTED",
        "STATUS",
        "REASON"
      ];

      const dataRows: (string | number)[][] =
        data.employeeLeaveRequestTeamJobRoleReports.map((item) => [
          item.employeeName,
          item.teams,
          item.leavePeriod,
          item.durationDays,
          item.leaveType,
          item.dateRequested,
          item.status,
          item.reason
        ]);

      const csvContent = unparse({
        fields: headers,
        data: dataRows
      });

      downloadCSV(csvContent, "Leave_Requests.csv");
      break;
    }

    case SheetType.CustomAllocation: {
      const headers: string[] = [
        "NAME",
        "TEAM",
        "LEAVE TYPE",
        "DAYS",
        "START DATE",
        "END DATE"
      ];

      const dataRows: (string | number)[][] =
        data.employeeCustomEntitlementTeamJobRoles.map((item) => [
          item.employeeName,
          item.teams,
          item.leaveType,
          item.days,
          item.startDate,
          item.endDate
        ]);

      const csvContent = unparse({
        fields: headers,
        data: dataRows
      });

      downloadCSV(csvContent, "Custom_Allocation.csv");
      break;
    }
  }
};
