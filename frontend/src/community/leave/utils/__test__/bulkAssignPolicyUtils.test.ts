import {
  buildBulkAssignPayload,
  getMissingBulkAssignHeaders
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
});
