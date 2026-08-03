import { createCSV } from "~community/common/utils/bulkUploadUtils";
import {
  BulkAssignPolicyPayload,
  BulkAssignPolicyResponse
} from "~community/leave/types/LeavePolicyTypes";

const EMPLOYEE_NAME_HEADER = "Employee Name";
const POLICY_NAME_HEADER = "Policy Name";
const EFFECTIVE_DATE_HEADER = "Effective Date";

export const BULK_ASSIGN_TEMPLATE_HEADERS = [
  EMPLOYEE_NAME_HEADER,
  POLICY_NAME_HEADER,
  EFFECTIVE_DATE_HEADER
];

// Spreadsheets evaluate a leading =, +, - or @ as a formula even inside a quoted
// field, so any value starting with one is prefixed with a single quote.
const FORMULA_TRIGGER_PATTERN = /^[=+\-@\t\r]/;

export const toCsvRow = (values: string[]): string =>
  values
    .map((value) => {
      const escaped = FORMULA_TRIGGER_PATTERN.test(value) ? `'${value}` : value;
      return `"${escaped.replace(/"/g, '""')}"`;
    })
    .join(",");

const normalizeHeader = (header: string): string =>
  header.trim().toLowerCase().replace(/\s+/g, " ");

const getCell = (
  row: Record<string, string | undefined>,
  header: string
): string => {
  const entry = Object.entries(row).find(
    ([rowHeader]) => normalizeHeader(rowHeader) === normalizeHeader(header)
  );
  return (entry?.[1] ?? "").trim();
};

export const getMissingBulkAssignHeaders = (
  fields: string[] = []
): string[] => {
  const present = fields.map(normalizeHeader);
  return BULK_ASSIGN_TEMPLATE_HEADERS.filter(
    (header) => !present.includes(normalizeHeader(header))
  );
};

export const buildBulkAssignPayload = (
  rows: Record<string, string | undefined>[]
): BulkAssignPolicyPayload => ({
  assignments: rows.map((row) => ({
    employeeName: getCell(row, EMPLOYEE_NAME_HEADER),
    policyName: getCell(row, POLICY_NAME_HEADER),
    effectiveDate: getCell(row, EFFECTIVE_DATE_HEADER)
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
      for (const log of response.bulkRecordErrorLogs) {
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
