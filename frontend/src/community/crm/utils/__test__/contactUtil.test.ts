import { CrmMetricLabelThemeEnum } from "~community/crm/enums/common";
import { CrmContactDetailResponseType } from "~community/crm/types/CommonTypes";

import { mapContactToMetricItems } from "../contactUtil";

const mockTranslateText = (keys: string[]): string => keys.join(".");

const baseContact: CrmContactDetailResponseType = {
  id: 1,
  name: "Test Contact",
  email: "test@example.com",
  contactNumber: "0711234567",
  lastModifiedDate: "2026-06-01T00:00:00",
  company: null,
  owner: {
    employeeId: 1,
    firstName: "Owner",
    lastName: "User",
    authPic: null
  },
  openTasksCount: 5,
  overdueTasksCount: 0,
  activeDealsCount: 3,
  totalRevenue: "45000.00",
  pipelineRevenue: "20000.00",
  tasks: [],
  deals: []
};

describe("mapContactToMetricItems", () => {
  it("should return 4 metric items in the correct order", () => {
    const result = mapContactToMetricItems(baseContact, mockTranslateText);

    expect(result).toHaveLength(4);
    expect(result[0].id).toBe("openTasksCount");
    expect(result[1].id).toBe("activeDealsCount");
    expect(result[2].id).toBe("totalRevenue");
    expect(result[3].id).toBe("pipelineRevenue");
  });

  it("should not include a chip when overdueTasksCount is 0", () => {
    const result = mapContactToMetricItems(baseContact, mockTranslateText);

    expect(result[0].chip).toBeUndefined();
  });

  it("should include a RED chip with interpolated count when overdueTasksCount > 0", () => {
    const contact = { ...baseContact, overdueTasksCount: 2 };
    const translateWithTemplate = (keys: string[]): string =>
      keys.join(".") === "metrics.overdueChipLabel"
        ? "{{count}} Overdue"
        : keys.join(".");
    const result = mapContactToMetricItems(contact, translateWithTemplate);

    expect(result[0].chip).toBeDefined();
    expect(result[0].chip?.variant).toBe(CrmMetricLabelThemeEnum.RED);
    expect(result[0].chip?.label).toBe("2 Overdue");
  });

  it("should mark totalRevenue and pipelineRevenue as currency", () => {
    const result = mapContactToMetricItems(baseContact, mockTranslateText);

    expect(result[2].isCurrency).toBe(true);
    expect(result[3].isCurrency).toBe(true);
  });

  it("should not mark count-based metrics as currency", () => {
    const result = mapContactToMetricItems(baseContact, mockTranslateText);

    expect(result[0].isCurrency).toBeFalsy();
    expect(result[1].isCurrency).toBeFalsy();
  });

  it("should convert count values to strings for the amount field", () => {
    const contact = { ...baseContact, openTasksCount: 7, activeDealsCount: 4 };
    const result = mapContactToMetricItems(contact, mockTranslateText);

    expect(result[0].amount).toBe("7");
    expect(result[1].amount).toBe("4");
  });

  it("should use the revenue strings from the API directly", () => {
    const result = mapContactToMetricItems(baseContact, mockTranslateText);

    expect(result[2].amount).toBe("45000.00");
    expect(result[3].amount).toBe("20000.00");
  });
});
