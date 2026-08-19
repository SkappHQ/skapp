import { ParseResult } from "papaparse";

import { createCSV } from "~community/common/utils/bulkUploadUtils";
import {
  CSV_DELIMITER,
  MAX_BULK_ASSIGN_ROWS
} from "~community/leave/constants/leavePolicyConstants";
import {
  BulkAssignCsvError,
  BulkAssignCsvHeaders,
  BulkAssignCsvValidation,
  BulkAssignPolicyPayload,
  BulkAssignPolicyResponse,
  BulkAssignPolicyRow
} from "~community/leave/types/LeavePolicyTypes";

// Spreadsheets evaluate a leading =, +, - or @ as a formula even inside a quoted
// field, so any value starting with one is prefixed with a single quote.
const FORMULA_TRIGGER_REGEX = /^[=+\-@\t\r]/;

const MULTIPLE_WHITESPACE_REGEX = /\s+/g;

export const toCsvRow = (values: string[]): string =>
  values
    .map(
      (value) =>
        `"${value.replace(FORMULA_TRIGGER_REGEX, "'$&").replaceAll('"', '""')}"`
    )
    .join(CSV_DELIMITER);

const toCsvValues = (row: BulkAssignCsvHeaders): string[] => [
  row.employeeName,
  row.policyName,
  row.effectiveDate
];

const normalizeHeader = (header: string): string =>
  header.trim().toLowerCase().replaceAll(MULTIPLE_WHITESPACE_REGEX, " ");

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
  headers: BulkAssignCsvHeaders
): string[] => {
  const present = new Set(fields.map(normalizeHeader));
  return toCsvValues(headers).filter(
    (header) => !present.has(normalizeHeader(header))
  );
};

const getUnexpectedBulkAssignHeaders = (
  fields: string[],
  headers: BulkAssignCsvHeaders
): string[] => {
  const expected = new Set(toCsvValues(headers).map(normalizeHeader));
  return fields.filter(
    (field) => field.trim() !== "" && !expected.has(normalizeHeader(field))
  );
};

const buildBulkAssignPayload = (
  rows: Record<string, string | undefined>[],
  headers: BulkAssignCsvHeaders
): BulkAssignPolicyPayload => ({
  assignments: rows.map((row) => ({
    employeeName: getCell(row, headers.employeeName),
    policyName: getCell(row, headers.policyName),
    effectiveDate: getCell(row, headers.effectiveDate)
  }))
});

export const validateBulkAssignCsv = (
  parseResult: ParseResult<Record<string, string>>,
  headers: BulkAssignCsvHeaders
): BulkAssignCsvValidation => {
  const missingColumns = getMissingBulkAssignHeaders(
    parseResult.meta.fields ?? [],
    headers
  );
  if (missingColumns.length > 0) {
    return {
      error: BulkAssignCsvError.MISSING_COLUMNS,
      missingColumns,
      unexpectedColumns: [],
      payload: null
    };
  }

  const unexpectedColumns = getUnexpectedBulkAssignHeaders(
    parseResult.meta.fields ?? [],
    headers
  );
  if (unexpectedColumns.length > 0) {
    return {
      error: BulkAssignCsvError.UNEXPECTED_COLUMNS,
      missingColumns: [],
      unexpectedColumns,
      payload: null
    };
  }

  if (parseResult.errors.length > 0) {
    return {
      error: BulkAssignCsvError.MALFORMED_ROWS,
      missingColumns: [],
      unexpectedColumns: [],
      payload: null
    };
  }

  if (parseResult.data.length === 0) {
    return {
      error: BulkAssignCsvError.EMPTY_FILE,
      missingColumns: [],
      unexpectedColumns: [],
      payload: null
    };
  }

  if (parseResult.data.length > MAX_BULK_ASSIGN_ROWS) {
    return {
      error: BulkAssignCsvError.TOO_MANY_ROWS,
      missingColumns: [],
      unexpectedColumns: [],
      payload: null
    };
  }

  return {
    error: null,
    missingColumns: [],
    unexpectedColumns: [],
    payload: buildBulkAssignPayload(parseResult.data, headers)
  };
};

export const downloadBulkAssignPolicyTemplate = (
  headers: BulkAssignCsvHeaders,
  exampleRow: BulkAssignPolicyRow
): void => {
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(toCsvRow(toCsvValues(headers)) + "\n");
      controller.enqueue(toCsvRow(toCsvValues(exampleRow)) + "\n");
      controller.close();
    }
  });
  createCSV(stream, "leave_policy_assignment_template");
};

export const downloadBulkAssignErrorReport = (
  assignmentResult: BulkAssignPolicyResponse,
  headers: BulkAssignCsvHeaders,
  errorHeader: string
): void => {
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(
        toCsvRow([...toCsvValues(headers), errorHeader]) + "\n"
      );
      for (const errorLog of assignmentResult.bulkRecordErrorLogs) {
        controller.enqueue(
          toCsvRow([...toCsvValues(errorLog), errorLog.error]) + "\n"
        );
      }
      controller.close();
    }
  });
  createCSV(stream, "leave_policy_assignment_errors");
};
