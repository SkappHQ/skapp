import { createCSV } from "~community/common/utils/bulkUploadUtils";
import {
  LeaveType,
  carryForwardTableDataType
} from "~community/leave/types/LeaveCarryForwardTypes";

export const downloadCarryForwardDataCSV = (
  rows: carryForwardTableDataType[],
  tableHeaders: { label: string; id: number }[]
) => {
  const predefinedHeaders = ["Employee ID", "Employee Name"];

  const leaveTypeHeaders = tableHeaders?.map((header) => header?.label);

  const headers = [...predefinedHeaders, ...leaveTypeHeaders];

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(headers.join(",") + "\n");
      for (const row of rows) {
        const rowData = [
          row?.employeeId,
          row?.name,

          ...tableHeaders.map((leaveType) => {
            const value = row[leaveType.id];
            return value !== undefined ? String(value) : "";
          })
        ];
        controller.enqueue(rowData.join(",") + "\n");
      }
      controller.close();
    }
  });

  createCSV(stream, "CarryForwardingBalances");
};

export const sortLeaveTypesInAlphabeticalOrder = (
  leaveTypes: LeaveType[]
): LeaveType[] => {
  const sortedArray = leaveTypes.sort((a, b) => {
    if (a.name < b.name) {
      return -1;
    }
    return 1;
  });

  return sortedArray;
};
