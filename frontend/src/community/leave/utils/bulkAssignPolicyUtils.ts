import { ParseResult } from "papaparse";

import { TranslatorFunctionType } from "~community/common/types/CommonTypes";
import { createCSV } from "~community/common/utils/bulkUploadUtils";
import { MAX_BULK_ASSIGN_ROWS } from "~community/leave/constants/leavePolicyConstants";
import {
  BulkAssignCsvValidation,
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

const getMissingBulkAssignHeaders = (
  fields: string[],
  translateText: TranslatorFunctionType
): string[] => {
  const present = new Set(fields.map(normalizeHeader));
  return Object.values(getBulkAssignTemplateHeaders(translateText)).filter(
    (header) => !present.has(normalizeHeader(header))
  );
};

const buildBulkAssignPayload = (
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

export const validateBulkAssignCsv = (
  parseResult: ParseResult<Record<string, string>>,
  translateText: TranslatorFunctionType
): BulkAssignCsvValidation => {
  const missingHeaders = getMissingBulkAssignHeaders(
    parseResult.meta.fields ?? [],
    translateText
  );
  if (missingHeaders.length > 0) {
    return {
      error: translateText(["missingColumnsError"], {
        columns: missingHeaders.join(", ")
      }),
      payload: null
    };
  }

  if (parseResult.errors.length > 0) {
    return { error: translateText(["malformedRowsError"]), payload: null };
  }

  if (parseResult.data.length === 0) {
    return { error: translateText(["emptyFileError"]), payload: null };
  }

  if (parseResult.data.length > MAX_BULK_ASSIGN_ROWS) {
    return {
      error: translateText(["tooManyRowsError"], {
        maxRows: MAX_BULK_ASSIGN_ROWS.toString()
      }),
      payload: null
    };
  }

  return {
    error: "",
    payload: buildBulkAssignPayload(parseResult.data, translateText)
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
  assignmentResult: BulkAssignPolicyResponse,
  translateText: TranslatorFunctionType
): void => {
  const headers = [
    ...Object.values(getBulkAssignTemplateHeaders(translateText)),
    translateText(["errorHeader"])
  ];

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(headers.join(",") + "\n");
      for (const errorLog of assignmentResult.bulkRecordErrorLogs) {
        controller.enqueue(
          toCsvRow([
            errorLog.employeeName,
            errorLog.policyName,
            errorLog.effectiveDate,
            errorLog.error
          ]) + "\n"
        );
      }
      controller.close();
    }
  });
  createCSV(stream, "leave_policy_assignment_errors");
};
