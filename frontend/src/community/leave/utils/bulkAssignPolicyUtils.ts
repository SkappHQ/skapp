import { TranslatorFunctionType } from "~community/common/types/CommonTypes";
import { createCSV } from "~community/common/utils/bulkUploadUtils";
import {
  BulkAssignPolicyPayload,
  BulkAssignPolicyResponse,
  BulkAssignPolicyRow
} from "~community/leave/types/LeavePolicyTypes";

const getBulkAssignTemplateHeaders = (
  translateText: TranslatorFunctionType
): Record<keyof BulkAssignPolicyRow, string> => ({
  employeeName: translateText(["employeeNameHeader"]),
  policyName: translateText(["policyNameHeader"]),
  effectiveDate: translateText(["effectiveDateHeader"])
});

// Spreadsheets evaluate a leading =, +, - or @ as a formula even inside a quoted
// field, so any value starting with one is prefixed with a single quote.
const FORMULA_TRIGGER_PATTERN = /^[=+\-@\t\r]/;

export const toCsvRow = (values: string[]): string =>
  values
    .map((value) => {
      const escaped = FORMULA_TRIGGER_PATTERN.test(value) ? `'${value}` : value;
      return `"${escaped.replaceAll('"', '""')}"`;
    })
    .join(",");

const normalizeHeader = (header: string): string =>
  header.trim().toLowerCase().replaceAll(/\s+/g, " ");

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
  fields: string[],
  translateText: TranslatorFunctionType
): string[] => {
  const present = new Set(fields.map(normalizeHeader));
  return Object.values(getBulkAssignTemplateHeaders(translateText)).filter(
    (header) => !present.has(normalizeHeader(header))
  );
};

export const buildBulkAssignPayload = (
  rows: Record<string, string | undefined>[],
  translateText: TranslatorFunctionType
): BulkAssignPolicyPayload => {
  const headers = getBulkAssignTemplateHeaders(translateText);

  return {
    assignments: rows.map((row) => ({
      employeeName: getCell(row, headers.employeeName),
      policyName: getCell(row, headers.policyName),
      effectiveDate: getCell(row, headers.effectiveDate)
    }))
  };
};

export const downloadBulkAssignPolicyTemplate = (
  translateText: TranslatorFunctionType
): void => {
  const headers = Object.values(getBulkAssignTemplateHeaders(translateText));
  const exampleRow = [
    translateText(["templateExampleEmployeeName"]),
    translateText(["templateExamplePolicyName"]),
    translateText(["templateExampleEffectiveDate"])
  ];

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(headers.join(",") + "\n");
      controller.enqueue(toCsvRow(exampleRow) + "\n");
      controller.close();
    }
  });
  createCSV(stream, "leave_policy_assignment_template");
};

export const downloadBulkAssignErrorReport = (
  response: BulkAssignPolicyResponse,
  translateText: TranslatorFunctionType
): void => {
  const headers = [
    ...Object.values(getBulkAssignTemplateHeaders(translateText)),
    translateText(["errorHeader"])
  ];

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
