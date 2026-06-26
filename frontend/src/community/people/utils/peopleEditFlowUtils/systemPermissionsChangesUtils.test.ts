import { Role } from "~community/people/enums/PeopleEnums";
import { L2SystemPermissionsType } from "~community/people/types/PeopleTypes";

import { getSystemPermissionsDetailsChanges } from "./systemPermissionsChangesUtils";

describe("getSystemPermissionsDetailsChanges", () => {
  it("should return changes for differing fields", () => {
    const newPermissions: L2SystemPermissionsType = {
      isSuperAdmin: true,
      leaveRole: Role.LEAVE_EMPLOYEE,
      attendanceRole: Role.ATTENDANCE_ADMIN,
      esignRole: Role.ESIGN_ADMIN,
      peopleRole: Role.PEOPLE_EMPLOYEE
    };
    const previousPermissions: L2SystemPermissionsType = {
      isSuperAdmin: true,
      leaveRole: Role.LEAVE_EMPLOYEE,
      attendanceRole: Role.ATTENDANCE_ADMIN,
      esignRole: Role.ESIGN_ADMIN,
      peopleRole: Role.PEOPLE_EMPLOYEE
    };

    const result = getSystemPermissionsDetailsChanges(
      newPermissions,
      previousPermissions
    );

    expect(result).toEqual({});
  });

  it("should return changes for partially defined objects", () => {
    const newPermissions: L2SystemPermissionsType = {
      isSuperAdmin: true
    };
    const previousPermissions: L2SystemPermissionsType = {
      isSuperAdmin: false
    };

    const result = getSystemPermissionsDetailsChanges(
      newPermissions,
      previousPermissions
    );

    expect(result).toEqual({
      isSuperAdmin: true
    });
  });
});
