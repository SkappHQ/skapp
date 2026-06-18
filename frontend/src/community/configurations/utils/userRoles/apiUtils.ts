import { Modules } from "~community/common/enums/CommonEnums";
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
    invoice: [],
    crm: []
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

const apiModuleToEnumMap: Record<string, Modules> = {
  attendance: Modules.ATTENDANCE,
  people: Modules.PEOPLE,
  leave: Modules.LEAVE,
  esignature: Modules.ESIGN,
  okr: Modules.OKR,
  invoice: Modules.INVOICE,
  projectmanagement: Modules.PM,
  crm: Modules.CRM
};

export const mapApiModuleToEnum = (apiModule?: string): Modules => {
  if (!apiModule) return Modules.NONE;
  return apiModuleToEnumMap[apiModule.toLowerCase()] ?? Modules.NONE;
};
