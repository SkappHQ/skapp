import { RoleLevel } from "~community/common/enums/CommonEnums";
import { RestrictionChanges } from "~community/configurations/types/UserRolesTypes";

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
): RestrictionChanges => ({
  addedRoles: selected.filter((roleLevel) => !initialSelected.includes(roleLevel)),
  removedRoles: initialSelected.filter(
    (roleLevel) => !selected.includes(roleLevel)
  )
});
