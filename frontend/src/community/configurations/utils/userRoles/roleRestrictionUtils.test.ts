import { RoleLevel } from "~community/common/enums/CommonEnums";

import {
  getRestrictionChanges,
  hasSelectionChanged,
  toggleRoleLevel
} from "./roleRestrictionUtils";

describe("toggleRoleLevel", () => {
  it("should add a role that is not selected", () => {
    expect(toggleRoleLevel([RoleLevel.ADMIN], RoleLevel.MANAGER)).toEqual([
      RoleLevel.ADMIN,
      RoleLevel.MANAGER
    ]);
  });

  it("should remove a role that is already selected", () => {
    expect(
      toggleRoleLevel([RoleLevel.ADMIN, RoleLevel.MANAGER], RoleLevel.ADMIN)
    ).toEqual([RoleLevel.MANAGER]);
  });

  it("should add to an empty selection", () => {
    expect(toggleRoleLevel([], RoleLevel.ADMIN)).toEqual([RoleLevel.ADMIN]);
  });

  it("should empty the selection when the last role is removed", () => {
    expect(toggleRoleLevel([RoleLevel.ADMIN], RoleLevel.ADMIN)).toEqual([]);
  });

  it("should not mutate the given selection", () => {
    const selected = [RoleLevel.ADMIN];

    toggleRoleLevel(selected, RoleLevel.MANAGER);

    expect(selected).toEqual([RoleLevel.ADMIN]);
  });
});

describe("hasSelectionChanged", () => {
  it("should report no change for the same roles", () => {
    expect(
      hasSelectionChanged(
        [RoleLevel.ADMIN, RoleLevel.MANAGER],
        [RoleLevel.ADMIN, RoleLevel.MANAGER]
      )
    ).toBe(false);
  });

  it("should report no change when the same roles are in a different order", () => {
    expect(
      hasSelectionChanged(
        [RoleLevel.MANAGER, RoleLevel.ADMIN],
        [RoleLevel.ADMIN, RoleLevel.MANAGER]
      )
    ).toBe(false);
  });

  it("should report no change for two empty selections", () => {
    expect(hasSelectionChanged([], [])).toBe(false);
  });

  it("should report a change when a role is added", () => {
    expect(
      hasSelectionChanged(
        [RoleLevel.ADMIN, RoleLevel.MANAGER],
        [RoleLevel.ADMIN]
      )
    ).toBe(true);
  });

  it("should report a change when a role is removed", () => {
    expect(
      hasSelectionChanged(
        [RoleLevel.ADMIN],
        [RoleLevel.ADMIN, RoleLevel.MANAGER]
      )
    ).toBe(true);
  });

  it("should report a change when a role is swapped for another", () => {
    expect(hasSelectionChanged([RoleLevel.MANAGER], [RoleLevel.ADMIN])).toBe(
      true
    );
  });

  it("should report a change when everything is cleared", () => {
    expect(hasSelectionChanged([], [RoleLevel.ADMIN])).toBe(true);
  });
});

describe("getRestrictionChanges", () => {
  it("should report a newly selected role in add", () => {
    expect(
      getRestrictionChanges([RoleLevel.ADMIN, RoleLevel.MANAGER], [RoleLevel.ADMIN])
    ).toEqual({ add: [RoleLevel.MANAGER], remove: [] });
  });

  it("should report a newly cleared role in remove", () => {
    expect(
      getRestrictionChanges([RoleLevel.ADMIN], [RoleLevel.ADMIN, RoleLevel.MANAGER])
    ).toEqual({ add: [], remove: [RoleLevel.MANAGER] });
  });

  it("should report a swapped role in both add and remove", () => {
    expect(
      getRestrictionChanges([RoleLevel.MANAGER], [RoleLevel.ADMIN])
    ).toEqual({ add: [RoleLevel.MANAGER], remove: [RoleLevel.ADMIN] });
  });

  it("should report empty add and remove when nothing changed", () => {
    expect(
      getRestrictionChanges(
        [RoleLevel.ADMIN, RoleLevel.MANAGER],
        [RoleLevel.MANAGER, RoleLevel.ADMIN]
      )
    ).toEqual({ add: [], remove: [] });
  });

  it("should report all roles in add when starting from an empty selection", () => {
    expect(getRestrictionChanges([RoleLevel.ADMIN], [])).toEqual({
      add: [RoleLevel.ADMIN],
      remove: []
    });
  });

  it("should report all roles in remove when everything is cleared", () => {
    expect(getRestrictionChanges([], [RoleLevel.ADMIN])).toEqual({
      add: [],
      remove: [RoleLevel.ADMIN]
    });
  });
});
