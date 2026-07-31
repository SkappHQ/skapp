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

export const getRestrictionChanges = (
  selected: RoleLevel[],
  initialSelected: RoleLevel[]
): { add: RoleLevel[]; remove: RoleLevel[] } => ({
  add: selected.filter((roleLevel) => !initialSelected.includes(roleLevel)),
  remove: initialSelected.filter((roleLevel) => !selected.includes(roleLevel))
});
