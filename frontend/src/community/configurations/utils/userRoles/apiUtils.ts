import { DropdownListType } from "~community/common/types/CommonTypes";
import {
  AllowedGrantableRolesResponseType,
  AllowedGrantableRolesType
} from "~community/configurations/types/UserRolesTypes";

export const transformRolesToDropdownFormat = (
  rolesData: AllowedGrantableRolesResponseType[]
): AllowedGrantableRolesType => {
  const result: AllowedGrantableRolesType = {
    leave: [],
    people: [],
    attendance: [],
    esign: [],
    pm: [],
    invoice: []
  };

  rolesData.forEach((moduleData) => {
    const moduleKey =
      moduleData.module.toLowerCase() as keyof AllowedGrantableRolesType;

    const dropdownOptions: DropdownListType[] = moduleData.roles.map(
      (role) => ({
        value: role.role,
        label: role.name
      })
    );

    if (moduleKey in result) {
      result[moduleKey] = dropdownOptions;
    }
  });

  return result;
};
