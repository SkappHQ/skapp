import { EntitlementYears } from "~community/leave/types/LeaveTypes";
import { EntitlementDetailType } from "~community/people/types/PeopleTypes";

import { processEntitlementPayload } from "../leaveUtils";

describe("processEntitlementPayload", () => {
  it("should process entitlement payload for the current year", () => {
    const mockDetails: EntitlementDetailType[] = [
      {
        year: new Date().getFullYear(),
        leaveType: "1",
        leaveName: "Annual Leave",
        numDays: 20,
        effectiveFrom: "2023-01-01",
        expirationDate: "2023-12-31"
      },
      {
        year: new Date().getFullYear() + 1,
        leaveType: "2",
        leaveName: "Sick Leave",
        numDays: 10,
        effectiveFrom: "2024-01-01",
        expirationDate: "2024-12-31"
      }
    ];

    const result = processEntitlementPayload({
      requiredYear: EntitlementYears.CURRENT,
      employeeName: "John Doe",
      email: "john.doe@example.com",
      employeeEntitlementsDetails: mockDetails
    });

    expect(result.year).toBe(new Date().getFullYear().toString());
    expect(result.entitlementDetailsList).toHaveLength(1);
    expect(result.entitlementDetailsList[0].entitlements).toHaveLength(1);
    expect(result.entitlementDetailsList[0].entitlements[0].name).toBe(
      "Annual Leave"
    );
  });

  it("should process entitlement payload for the next year", () => {
    const mockDetails: EntitlementDetailType[] = [
      {
        year: new Date().getFullYear(),
        leaveType: "1",
        leaveName: "Annual Leave",
        numDays: 20,
        effectiveFrom: "2023-01-01",
        expirationDate: "2023-12-31"
      },
      {
        year: new Date().getFullYear() + 1,
        leaveType: "2",
        leaveName: "Sick Leave",
        numDays: 10,
        effectiveFrom: "2024-01-01",
        expirationDate: "2024-12-31"
      }
    ];

    const result = processEntitlementPayload({
      requiredYear: EntitlementYears.NEXT,
      employeeName: "Jane Doe",
      email: "jane.doe@example.com",
      employeeEntitlementsDetails: mockDetails
    });

    expect(result.year).toBe((new Date().getFullYear() + 1).toString());
    expect(result.entitlementDetailsList).toHaveLength(1);
    expect(result.entitlementDetailsList[0].entitlements).toHaveLength(1);
    expect(result.entitlementDetailsList[0].entitlements[0].name).toBe(
      "Sick Leave"
    );
  });

  it("should return an empty entitlements list if no matching year is found", () => {
    const mockDetails: EntitlementDetailType[] = [
      {
        year: new Date().getFullYear() - 1,
        leaveType: "1",
        leaveName: "Annual Leave",
        numDays: 20,
        effectiveFrom: "2022-01-01",
        expirationDate: "2022-12-31"
      }
    ];

    const result = processEntitlementPayload({
      requiredYear: EntitlementYears.CURRENT,
      employeeName: "John Smith",
      email: "john.smith@example.com",
      employeeEntitlementsDetails: mockDetails
    });

    expect(result.year).toBe(new Date().getFullYear().toString());
    expect(result.entitlementDetailsList).toHaveLength(1);
    expect(result.entitlementDetailsList[0].entitlements).toHaveLength(0);
  });
});
