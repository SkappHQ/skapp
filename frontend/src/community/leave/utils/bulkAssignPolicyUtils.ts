import { createCSV } from "~community/common/utils/bulkUploadUtils";
import {
  BulkAssignPolicyPayload,
  BulkAssignPolicyResponse
} from "~community/leave/types/LeavePolicyTypes";

export const BULK_ASSIGN_TEMPLATE_HEADERS = [
  "Employee Name",
  "Policy Name",
  "Effective Date"
];

const toCsvRow = (values: string[]): string =>
  values.map((value) => `"${(value ?? "").replace(/"/g, '""')}"`).join(",");

export const getMissingBulkAssignHeaders = (
  fields: string[] = []
): string[] => {
  const present = fields.map((field) => field.trim());
  return BULK_ASSIGN_TEMPLATE_HEADERS.filter(
    (header) => !present.includes(header)
  );
};

export const buildBulkAssignPayload = (
  rows: Record<string, string>[]
): BulkAssignPolicyPayload => ({
  assignments: rows.map((row) => ({
    employeeName: (row["Employee Name"] ?? "").trim(),
    policyName: (row["Policy Name"] ?? "").trim(),
    effectiveDate: (row["Effective Date"] ?? "").trim()
  }))
});

export const downloadBulkAssignPolicyTemplate = (): void => {
  const exampleRow = ["John Doe", "Annual Leave Policy", "01/06/2026"];
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(BULK_ASSIGN_TEMPLATE_HEADERS.join(",") + "\n");
      controller.enqueue(toCsvRow(exampleRow) + "\n");
      controller.close();
    }
  });
  createCSV(stream, "leave_policy_assignment_template");
};

export const downloadBulkAssignErrorReport = (
  response: BulkAssignPolicyResponse
): void => {
  const headers = [...BULK_ASSIGN_TEMPLATE_HEADERS, "Error"];
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(headers.join(",") + "\n");
      for (const log of response?.bulkRecordErrorLogs ?? []) {
        controller.enqueue(
          toCsvRow([
            log.employeeName,
            log.policyName,
            log.effectiveDate,
            log.error
          ]) + "\n"
        );
      }
      controller.close();
    }
  });
  createCSV(stream, "leave_policy_assignment_errors");
};
