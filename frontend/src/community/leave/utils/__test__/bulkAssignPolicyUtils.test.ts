import { ParseResult } from "papaparse";

import { MAX_BULK_ASSIGN_ROWS } from "~community/leave/constants/leavePolicyConstants";

import { toCsvRow, validateBulkAssignCsv } from "../bulkAssignPolicyUtils";

const translations: Record<string, string> = {
  employeeNameHeader: "Employee Name",
  policyNameHeader: "Policy Name",
  effectiveDateHeader: "Effective Date",
  missingColumnsError: "missingColumnsError",
  malformedRowsError: "malformedRowsError",
  emptyFileError: "emptyFileError",
  tooManyRowsError: "tooManyRowsError"
};

const translateText = (suffixes: string[]): string => translations[suffixes[0]];

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
      validateBulkAssignCsv(buildParseResult([validRow]), translateText)
    ).toEqual({
      error: "",
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
    const result = validateBulkAssignCsv(
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
      translateText
    );

    expect(result.error).toBe("");
    expect(result.payload).toEqual({
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
      validateBulkAssignCsv(buildParseResult([{}]), translateText).payload
    ).toEqual({
      assignments: [{ employeeName: "", policyName: "", effectiveDate: "" }]
    });
  });

  it("rejects a file that is missing required columns", () => {
    const result = validateBulkAssignCsv(
      buildParseResult([validRow], ["Employee Name"]),
      translateText
    );

    expect(result).toEqual({ error: "missingColumnsError", payload: null });
  });

  it("rejects a file with rows that could not be parsed", () => {
    const result = validateBulkAssignCsv(
      buildParseResult([validRow], undefined, [
        { type: "Quotes", code: "InvalidQuotes", message: "", row: 0 }
      ]),
      translateText
    );

    expect(result).toEqual({ error: "malformedRowsError", payload: null });
  });

  it("rejects a file with no data rows", () => {
    expect(validateBulkAssignCsv(buildParseResult([]), translateText)).toEqual({
      error: "emptyFileError",
      payload: null
    });
  });

  it("rejects a file with more rows than the allowed maximum", () => {
    const rows = Array.from({ length: MAX_BULK_ASSIGN_ROWS + 1 }, () => ({
      ...validRow
    }));

    expect(
      validateBulkAssignCsv(buildParseResult(rows), translateText)
    ).toEqual({ error: "tooManyRowsError", payload: null });
  });

  it("reports missing columns before any other problem", () => {
    const result = validateBulkAssignCsv(
      buildParseResult([], ["Employee Name"]),
      translateText
    );

    expect(result.error).toBe("missingColumnsError");
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
