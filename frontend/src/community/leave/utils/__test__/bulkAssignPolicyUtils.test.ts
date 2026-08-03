import {
  buildBulkAssignPayload,
  getMissingBulkAssignHeaders,
  toCsvRow
} from "../bulkAssignPolicyUtils";

describe("getMissingBulkAssignHeaders", () => {
  it("returns an empty array when all required headers are present", () => {
    expect(
      getMissingBulkAssignHeaders([
        "Employee Name",
        "Policy Name",
        "Effective Date"
      ])
    ).toEqual([]);
  });

  it("returns only the headers that are missing", () => {
    expect(getMissingBulkAssignHeaders(["Employee Name"])).toEqual([
      "Policy Name",
      "Effective Date"
    ]);
  });

  it("treats an absent fields argument as all headers missing", () => {
    expect(getMissingBulkAssignHeaders()).toEqual([
      "Employee Name",
      "Policy Name",
      "Effective Date"
    ]);
  });

  it("accepts headers that differ only by case and spacing", () => {
    expect(
      getMissingBulkAssignHeaders([
        " employee  name ",
        "POLICY NAME",
        "effective date"
      ])
    ).toEqual([]);
  });
});

describe("buildBulkAssignPayload", () => {
  it("maps CSV rows to a trimmed assignment payload", () => {
    const rows = [
      {
        "Employee Name": " John Doe ",
        "Policy Name": "Annual Leave Policy",
        "Effective Date": "01/06/2026"
      }
    ];

    expect(buildBulkAssignPayload(rows)).toEqual({
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
    expect(buildBulkAssignPayload([{}])).toEqual({
      assignments: [{ employeeName: "", policyName: "", effectiveDate: "" }]
    });
  });

  it("reads cells from headers that differ only by case and spacing", () => {
    const rows = [
      {
        "employee  name": "John Doe",
        "POLICY NAME": "Annual Leave Policy",
        "Effective Date ": "01/06/2026"
      }
    ];

    expect(buildBulkAssignPayload(rows)).toEqual({
      assignments: [
        {
          employeeName: "John Doe",
          policyName: "Annual Leave Policy",
          effectiveDate: "01/06/2026"
        }
      ]
    });
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
