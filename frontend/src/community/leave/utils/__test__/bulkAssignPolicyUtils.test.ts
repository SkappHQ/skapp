import { ParseResult } from "papaparse";

import { MAX_BULK_ASSIGN_ROWS } from "~community/leave/constants/leavePolicyConstants";
import {
  BulkAssignCsvError,
  BulkAssignCsvHeaders
} from "~community/leave/types/LeavePolicyTypes";

import { toCsvRow, validateBulkAssignCsv } from "../bulkAssignPolicyUtils";

const headers: BulkAssignCsvHeaders = {
  employeeName: "Employee Name",
  policyName: "Policy Name",
  effectiveDate: "Effective Date"
};

const buildParseResult = (
  data: Record<string, string>[],
  fields: string[] = ["Employee Name", "Policy Name", "Effective Date"],
  errors: ParseResult<Record<string, string>>["errors"] = []
): ParseResult<Record<string, string>> =>
  ({
    data,
    errors,
    meta: { fields }
  }) as ParseResult<Record<string, string>>;

const validRow = {
  "Employee Name": " John Doe ",
  "Policy Name": "Annual Leave Policy",
  "Effective Date": "01/06/2026"
};

describe("validateBulkAssignCsv", () => {
  it("maps CSV rows to a trimmed assignment payload", () => {
    expect(
      validateBulkAssignCsv(buildParseResult([validRow]), headers)
    ).toEqual({
      error: null,
      missingColumns: [],
      unexpectedColumns: [],
      payload: {
        assignments: [
          {
            employeeName: "John Doe",
            policyName: "Annual Leave Policy",
            effectiveDate: "01/06/2026"
          }
        ]
      }
    });
  });

  it("reads cells from headers that differ only by case and spacing", () => {
    const validation = validateBulkAssignCsv(
      buildParseResult(
        [
          {
            "employee  name": "John Doe",
            "POLICY NAME": "Annual Leave Policy",
            "Effective Date ": "01/06/2026"
          }
        ],
        [" employee  name ", "POLICY NAME", "effective date"]
      ),
      headers
    );

    expect(validation.error).toBeNull();
    expect(validation.payload).toEqual({
      assignments: [
        {
          employeeName: "John Doe",
          policyName: "Annual Leave Policy",
          effectiveDate: "01/06/2026"
        }
      ]
    });
  });

  it("defaults missing cells to empty strings", () => {
    expect(
      validateBulkAssignCsv(buildParseResult([{}]), headers).payload
    ).toEqual({
      assignments: [{ employeeName: "", policyName: "", effectiveDate: "" }]
    });
  });

  it("rejects a file that is missing required columns", () => {
    const validation = validateBulkAssignCsv(
      buildParseResult([validRow], ["Employee Name"]),
      headers
    );

    expect(validation).toEqual({
      error: BulkAssignCsvError.MISSING_COLUMNS,
      missingColumns: ["Policy Name", "Effective Date"],
      unexpectedColumns: [],
      payload: null
    });
  });

  it("rejects a file with rows that could not be parsed", () => {
    const validation = validateBulkAssignCsv(
      buildParseResult([validRow], undefined, [
        { type: "Quotes", code: "InvalidQuotes", message: "", row: 0 }
      ]),
      headers
    );

    expect(validation.error).toBe(BulkAssignCsvError.MALFORMED_ROWS);
    expect(validation.payload).toBeNull();
  });

  it("rejects a file with no data rows", () => {
    const validation = validateBulkAssignCsv(buildParseResult([]), headers);

    expect(validation.error).toBe(BulkAssignCsvError.EMPTY_FILE);
    expect(validation.payload).toBeNull();
  });

  it("rejects a file with more rows than the allowed maximum", () => {
    const rows = Array.from({ length: MAX_BULK_ASSIGN_ROWS + 1 }, () => ({
      ...validRow
    }));

    const validation = validateBulkAssignCsv(buildParseResult(rows), headers);

    expect(validation.error).toBe(BulkAssignCsvError.TOO_MANY_ROWS);
    expect(validation.payload).toBeNull();
  });

  it("rejects a downloaded error report re-uploaded as bulk data", () => {
    const validation = validateBulkAssignCsv(
      buildParseResult(
        [{ ...validRow, Error: "Employee already has an Annual Leave policy" }],
        ["Employee Name", "Policy Name", "Effective Date", "Error"]
      ),
      headers
    );

    expect(validation).toEqual({
      error: BulkAssignCsvError.UNEXPECTED_COLUMNS,
      missingColumns: [],
      unexpectedColumns: ["Error"],
      payload: null
    });
  });

  it("ignores blank trailing headers that spreadsheets append", () => {
    const validation = validateBulkAssignCsv(
      buildParseResult(
        [validRow],
        ["Employee Name", "Policy Name", "Effective Date", "", "  "]
      ),
      headers
    );

    expect(validation.error).toBeNull();
    expect(validation.payload).not.toBeNull();
  });

  it("reports missing columns before any other problem", () => {
    const validation = validateBulkAssignCsv(
      buildParseResult([], ["Employee Name"]),
      headers
    );

    expect(validation.error).toBe(BulkAssignCsvError.MISSING_COLUMNS);
  });
});

describe("toCsvRow", () => {
  it("quotes every value so commas and newlines stay inside their cell", () => {
    expect(toCsvRow(["Doe, John", "Annual\nLeave", "01/06/2026"])).toBe(
      '"Doe, John","Annual\nLeave","01/06/2026"'
    );
  });

  it("doubles embedded double quotes", () => {
    expect(toCsvRow(['John "JD" Doe'])).toBe('"John ""JD"" Doe"');
  });

  it("neutralises values that a spreadsheet would evaluate as a formula", () => {
    expect(toCsvRow(["=1+1", "+44 77", "-cmd", "@SUM(A1)"])).toBe(
      `"'=1+1","'+44 77","'-cmd","'@SUM(A1)"`
    );
  });

  it("leaves ordinary values untouched", () => {
    expect(toCsvRow(["John Doe", "Annual Leave Policy"])).toBe(
      '"John Doe","Annual Leave Policy"'
    );
  });
});
