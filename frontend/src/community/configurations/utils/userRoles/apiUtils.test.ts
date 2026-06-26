import { AllowedGrantableRolesResponseType } from "~community/configurations/types/UserRolesTypes";

import { transformRolesToDropdownFormat } from "./apiUtils";

describe("transformRolesToDropdownFormat", () => {
  it("should transform roles data into dropdown format correctly", () => {
    const rolesData: AllowedGrantableRolesResponseType[] = [
      {
        module: "Leave",
        roles: [
          { role: "admin", name: "Admin" },
          { role: "user", name: "User" }
        ]
      },
      {
        module: "People",
        roles: [
          { role: "manager", name: "Manager" },
          { role: "employee", name: "Employee" }
        ]
      }
    ];

    const result = transformRolesToDropdownFormat(rolesData);

    expect(result).toEqual({
      leave: [
        { value: "admin", label: "Admin" },
        { value: "user", label: "User" }
      ],
      people: [
        { value: "manager", label: "Manager" },
        { value: "employee", label: "Employee" }
      ],
      attendance: [],
      esign: []
    });
  });

  it("should handle empty roles data", () => {
    const rolesData: AllowedGrantableRolesResponseType[] = [];

    const result = transformRolesToDropdownFormat(rolesData);

    expect(result).toEqual({
      leave: [],
      people: [],
      attendance: [],
      esign: []
    });
  });

  it("should ignore modules not defined in AllowedGrantableRolesType", () => {
    const rolesData: AllowedGrantableRolesResponseType[] = [
      {
        module: "UnknownModule",
        roles: [{ role: "test", name: "Test" }]
      }
    ];

    const result = transformRolesToDropdownFormat(rolesData);

    expect(result).toEqual({
      leave: [],
      people: [],
      attendance: [],
      esign: []
    });
  });
});
