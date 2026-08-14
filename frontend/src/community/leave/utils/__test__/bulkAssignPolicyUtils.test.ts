import { ParseResult } from "papaparse";

import { MAX_BULK_ASSIGN_ROWS } from "~community/leave/constants/leavePolicyConstants";
import {
  BulkAssignCsvError,
  BulkAssignResourceHeaders,
  BulkAssignTemplateHeaders,
  LeavePolicyStatus,
  LeavePolicyType,
  PolicyType
} from "~community/leave/types/LeavePolicyTypes";

import {
  buildBulkAssignTemplateSheets,
  toCsvRow,
  validateBulkAssignCsv
} from "../bulkAssignPolicyUtils";

const headers: BulkAssignTemplateHeaders = {
  employeeEmail: "Employee Email",
  policyId: "Policy ID",
  effectiveDate: "Effective Date"
};

const resourceHeaders: BulkAssignResourceHeaders = {
  policyId: "Policy ID",
  policyName: "Policy Name",
  leaveType: "Leave Type"
};

const buildParseResult = (
  data: Record<string, string>[],
  fields: string[] = ["Employee Email", "Policy ID", "Effective Date"],
  errors: ParseResult<Record<string, string>>["errors"] = []
): ParseResult<Record<string, string>> =>
  ({
    data,
    errors,
    meta: { fields }
  }) as ParseResult<Record<string, string>>;

const validRow = {
  "Employee Email": " john.doe@company.com ",
  "Policy ID": "12",
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
            employeeEmail: "john.doe@company.com",
            policyId: "12",
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
            "employee  email": "john.doe@company.com",
            "POLICY ID": "12",
            "Effective Date ": "01/06/2026"
          }
        ],
        [" employee  email ", "POLICY ID", "effective date"]
      ),
      headers
    );

    expect(validation.error).toBeNull();
    expect(validation.payload).toEqual({
      assignments: [
        {
          employeeEmail: "john.doe@company.com",
          policyId: "12",
          effectiveDate: "01/06/2026"
        }
      ]
    });
  });

  it("defaults missing cells to empty strings", () => {
    expect(
      validateBulkAssignCsv(buildParseResult([{}]), headers).payload
    ).toEqual({
      assignments: [{ employeeEmail: "", policyId: "", effectiveDate: "" }]
    });
  });

  it("rejects a file that is missing required columns", () => {
    const validation = validateBulkAssignCsv(
      buildParseResult([validRow], ["Employee Email"]),
      headers
    );

    expect(validation).toEqual({
      error: BulkAssignCsvError.MISSING_COLUMNS,
      missingColumns: ["Policy ID", "Effective Date"],
      unexpectedColumns: [],
      payload: null
    });
  });

  it("rejects a downloaded error report that is uploaded back", () => {
    const validation = validateBulkAssignCsv(
      buildParseResult(
        [{ ...validRow, Error: "Employee not found" }],
        ["Employee Email", "Policy ID", "Effective Date", "Error"]
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

  it("ignores the blank trailing columns that spreadsheets export", () => {
    const validation = validateBulkAssignCsv(
      buildParseResult(
        [validRow],
        ["Employee Email", "Policy ID", "Effective Date", "", "  "]
      ),
      headers
    );

    expect(validation.error).toBeNull();
    expect(validation.unexpectedColumns).toEqual([]);
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

  it("reports missing columns before any other problem", () => {
    const validation = validateBulkAssignCsv(
      buildParseResult([], ["Employee Email"]),
      headers
    );

    expect(validation.error).toBe(BulkAssignCsvError.MISSING_COLUMNS);
  });
});

describe("buildBulkAssignTemplateSheets", () => {
  const policies = [
    {
      id: 12,
      name: "Annual Leave Policy",
      leaveTypeName: "Annual",
      status: LeavePolicyStatus.ACTIVE,
      policyType: PolicyType.ACCRUAL
    },
    {
      id: 13,
      name: "Casual Leave Policy",
      leaveTypeName: "Casual",
      status: LeavePolicyStatus.ACTIVE,
      policyType: PolicyType.ACCRUAL
    }
  ] as LeavePolicyType[];

  const sheets = buildBulkAssignTemplateSheets({
    sheetNames: { template: "Template", resource: "Resources" },
    headers,
    exampleRow: {
      employeeEmail: "john.doe@company.com",
      policyId: "12",
      effectiveDate: "01/06/2026"
    },
    resourceHeaders,
    policies
  });

  it("puts the upload columns and an example row on the template tab", () => {
    expect(sheets[0].name).toBe("Template");
    expect(sheets[0].rows).toEqual([
      ["Employee Email", "Policy ID", "Effective Date"],
      ["john.doe@company.com", "12", "01/06/2026"]
    ]);
  });

  it("lists every assignable policy on the resource tab", () => {
    expect(sheets[1].name).toBe("Resources");
    expect(sheets[1].rows).toEqual([
      ["Policy ID", "Policy Name", "Leave Type"],
      [12, "Annual Leave Policy", "Annual"],
      [13, "Casual Leave Policy", "Casual"]
    ]);
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
