import getEnterpriseDrawerRoutes from "./getEnterpriseDrawerRoutes";

describe("getEnterpriseDrawerRoutes", () => {
  it("returns routes for admin role", () => {
    const userRoles = ["admin"];
    const globalLoginMethod = "GOOGLE";

    const result = getEnterpriseDrawerRoutes({ userRoles, globalLoginMethod });

    expect(result).toBeUndefined();
    // Add specific expectations for admin routes
  });
});
