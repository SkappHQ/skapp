import { RoleLevel } from "~community/common/enums/CommonEnums";

export const toggleRoleLevel = (
  selected: RoleLevel[],
  roleLevel: RoleLevel
): RoleLevel[] =>
  selected.includes(roleLevel)
    ? selected.filter((selectedRole) => selectedRole !== roleLevel)
    : [...selected, roleLevel];

export const hasSelectionChanged = (
  selected: RoleLevel[],
  initialSelected: RoleLevel[]
): boolean =>
  selected.length !== initialSelected.length ||
  selected.some((roleLevel) => !initialSelected.includes(roleLevel));
