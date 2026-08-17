import { ParseResult } from "papaparse";

import { createCSV } from "~community/common/utils/bulkUploadUtils";
import { XlsxSheet, downloadXlsx } from "~community/common/utils/xlsxUtils";
import {
  BULK_ASSIGN_ERROR_REPORT_FILE_NAME,
  BULK_ASSIGN_TEMPLATE_COLUMN_WIDTH,
  BULK_ASSIGN_TEMPLATE_FILE_NAME,
  CSV_DELIMITER,
  MAX_BULK_ASSIGN_ROWS
} from "~community/leave/constants/leavePolicyConstants";
import {
  BulkAssignCsvError,
  BulkAssignCsvValidation,
  BulkAssignPolicyPayload,
  BulkAssignPolicyResponse,
  BulkAssignResourceHeaders,
  BulkAssignTemplateContent,
  BulkAssignTemplateHeaders
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

const toTemplateRowValues = (row: BulkAssignTemplateHeaders): string[] => [
  row.employeeEmail,
  row.policyId,
  row.effectiveDate
];

const toResourceRowValues = (row: BulkAssignResourceHeaders): string[] => [
  row.policyId,
  row.policyName,
  row.leaveType
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
  headers: BulkAssignTemplateHeaders
): string[] => {
  const present = new Set(fields.map(normalizeHeader));
  return toTemplateRowValues(headers).filter(
    (header) => !present.has(normalizeHeader(header))
  );
};

const getUnexpectedBulkAssignHeaders = (
  fields: string[],
  headers: BulkAssignTemplateHeaders
): string[] => {
  const expected = new Set(toTemplateRowValues(headers).map(normalizeHeader));
  return fields
    .map((field) => field.trim())
    .filter((field) => field !== "" && !expected.has(normalizeHeader(field)));
};

const buildBulkAssignPayload = (
  rows: Record<string, string | undefined>[],
  headers: BulkAssignTemplateHeaders
): BulkAssignPolicyPayload => ({
  assignments: rows.map((row) => ({
    employeeEmail: getCell(row, headers.employeeEmail),
    policyId: getCell(row, headers.policyId),
    effectiveDate: getCell(row, headers.effectiveDate)
  }))
});

const getBulkAssignCsvError = (
  parseResult: ParseResult<Record<string, string>>,
  missingColumns: string[],
  unexpectedColumns: string[]
): BulkAssignCsvError | null => {
  if (missingColumns.length > 0) {
    return BulkAssignCsvError.MISSING_COLUMNS;
  }

  if (unexpectedColumns.length > 0) {
    return BulkAssignCsvError.UNEXPECTED_COLUMNS;
  }

  if (parseResult.errors.length > 0) {
    return BulkAssignCsvError.MALFORMED_ROWS;
  }

  if (parseResult.data.length === 0) {
    return BulkAssignCsvError.EMPTY_FILE;
  }

  if (parseResult.data.length > MAX_BULK_ASSIGN_ROWS) {
    return BulkAssignCsvError.TOO_MANY_ROWS;
  }

  return null;
};

export const validateBulkAssignCsv = (
  parseResult: ParseResult<Record<string, string>>,
  headers: BulkAssignTemplateHeaders
): BulkAssignCsvValidation => {
  const fields = parseResult.meta.fields ?? [];
  const missingColumns = getMissingBulkAssignHeaders(fields, headers);
  const unexpectedColumns = getUnexpectedBulkAssignHeaders(fields, headers);

  const error = getBulkAssignCsvError(
    parseResult,
    missingColumns,
    unexpectedColumns
  );

  return {
    error,
    missingColumns,
    unexpectedColumns,
    payload: error ? null : buildBulkAssignPayload(parseResult.data, headers)
  };
};

export const buildBulkAssignTemplateSheets = ({
  sheetNames,
  headers,
  exampleRow,
  resourceHeaders,
  policies
}: BulkAssignTemplateContent): XlsxSheet[] => [
  {
    name: sheetNames.template,
    columnWidth: BULK_ASSIGN_TEMPLATE_COLUMN_WIDTH,
    rows: [toTemplateRowValues(headers), toTemplateRowValues(exampleRow)]
  },
  {
    name: sheetNames.resource,
    columnWidth: BULK_ASSIGN_TEMPLATE_COLUMN_WIDTH,
    rows: [
      toResourceRowValues(resourceHeaders),
      ...policies.map((policy) => [
        policy.id,
        policy.name,
        policy.leaveTypeName
      ])
    ]
  }
];

export const downloadBulkAssignPolicyTemplate = (
  content: BulkAssignTemplateContent
): void =>
  downloadXlsx(
    buildBulkAssignTemplateSheets(content),
    BULK_ASSIGN_TEMPLATE_FILE_NAME
  );

export const downloadBulkAssignErrorReport = (
  assignmentResult: BulkAssignPolicyResponse,
  headers: BulkAssignTemplateHeaders,
  errorHeader: string
): void => {
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(
        toCsvRow([...toTemplateRowValues(headers), errorHeader]) + "\n"
      );
      for (const errorLog of assignmentResult.bulkRecordErrorLogs) {
        controller.enqueue(
          toCsvRow([...toTemplateRowValues(errorLog), errorLog.error]) + "\n"
        );
      }
      controller.close();
    }
  });
  createCSV(stream, BULK_ASSIGN_ERROR_REPORT_FILE_NAME);
};
