import {
  ChecklistVerificationFilledIcon,
  EmailFilledIcon,
  MeetingFilledIcon,
  PhoneFilledIcon
} from "@rootcodelabs/skapp-ui";
import { DateTime } from "luxon";

import { CrmTaskTabEnum } from "../enums/common";
import {
  CrmOwnerEntity,
  CrmTaskEntity,
  CrmTaskRecord,
  CrmTaskTypeRecord
} from "../types/CrmCommonTypes";
import {
  getChangedTaskFields,
  getDueDateStatus,
  getOwnerFullName,
  getTaskGroups,
  getTaskTypeIcon,
  getTaskTypeName,
  groupTaskIdsByDueDate,
  isCrmTaskTab,
  mergeTasks,
  prependTaskId,
  removeTaskFromRecord,
  removeTaskId,
  toTaskIds
} from "./taskUtil";

jest.mock(
  "@rootcodelabs/skapp-ui",
  () => ({
    ChecklistVerificationFilledIcon: () => null,
    EmailFilledIcon: () => null,
    MeetingFilledIcon: () => null,
    PhoneFilledIcon: () => null
  }),
  { virtual: true }
);

const task = (
  id: number,
  overrides: Partial<CrmTaskEntity> = {}
): CrmTaskEntity => ({
  id,
  name: `Task ${id}`,
  ...overrides
});

describe("toTaskIds", () => {
  it("extracts ids from a list of tasks", () => {
    expect(toTaskIds([task(1), task(2), task(3)])).toEqual([1, 2, 3]);
  });

  it("skips tasks with no id", () => {
    expect(toTaskIds([task(1), { name: "no id" }, task(2)])).toEqual([1, 2]);
  });
});

describe("mergeTasks", () => {
  it("adds new tasks into an empty record", () => {
    const result = mergeTasks({}, [task(1), task(2)]);
    expect(result).toEqual({ 1: task(1), 2: task(2) });
  });

  it("shallow-merges onto an existing entry instead of replacing it", () => {
    const existing: CrmTaskRecord = {
      1: task(1, { notes: "original notes", priority: undefined })
    };
    const result = mergeTasks(existing, [task(1, { priority: undefined })]);

    expect(result[1]).toMatchObject({ id: 1, notes: "original notes" });
  });

  it("skips incoming tasks with no id", () => {
    const result = mergeTasks({}, [{ name: "no id" }]);
    expect(result).toEqual({});
  });
});

describe("prependTaskId / removeTaskId", () => {
  it("prepends a new id to the front", () => {
    expect(prependTaskId([2, 3], 1)).toEqual([1, 2, 3]);
  });

  it("does not duplicate an id that is already present", () => {
    expect(prependTaskId([1, 2, 3], 1)).toEqual([1, 2, 3]);
  });

  it("removes an id from the list", () => {
    expect(removeTaskId([1, 2, 3], 2)).toEqual([1, 3]);
  });
});

describe("removeTaskFromRecord", () => {
  it("deletes the entry for the given id", () => {
    const existing: CrmTaskRecord = { 1: task(1), 2: task(2) };
    expect(removeTaskFromRecord(existing, 1)).toEqual({ 2: task(2) });
  });

  it("returns the same reference when the id is not present", () => {
    const existing: CrmTaskRecord = { 1: task(1) };
    expect(removeTaskFromRecord(existing, 99)).toBe(existing);
  });
});

describe("getDueDateStatus", () => {
  it("returns null when there is no due date", () => {
    expect(getDueDateStatus(undefined, false)).toBeNull();
  });

  it("returns an overdue status with a dayCount for a past-due open task", () => {
    const dueAt = DateTime.local().minus({ days: 3 }).toUTC().toISO();

    const result = getDueDateStatus(dueAt, false);

    expect(result?.textKey).toBe("dueDateOverdue");
    expect(result?.dayCount).toBeGreaterThanOrEqual(1);
  });

  it("omits dayCount for a task due today", () => {
    const dueAt = DateTime.local().toUTC().toISO();

    const result = getDueDateStatus(dueAt, false);

    expect(result?.textKey).toBe("dueDateToday");
    expect(result?.dayCount).toBeUndefined();
  });

  it("omits dayCount for a task due in the future", () => {
    const dueAt = DateTime.local().plus({ days: 5 }).toUTC().toISO();

    const result = getDueDateStatus(dueAt, false);

    expect(result?.textKey).toBe("dueDateDueOn");
    expect(result?.dayCount).toBeUndefined();
  });

  it("treats a completed task as due-on rather than overdue", () => {
    const dueAt = DateTime.local().minus({ days: 3 }).toUTC().toISO();

    const result = getDueDateStatus(dueAt, true);

    expect(result?.textKey).toBe("dueDateDueOn");
  });
});

describe("getTaskTypeIcon", () => {
  it.each([
    ["Email", EmailFilledIcon],
    ["email", EmailFilledIcon],
    ["Call", PhoneFilledIcon],
    ["Meeting", MeetingFilledIcon],
    ["Other", ChecklistVerificationFilledIcon],
    ["Unrecognized", ChecklistVerificationFilledIcon],
    [undefined, ChecklistVerificationFilledIcon]
  ])("maps type name %s to the right icon", (typeName, icon) => {
    expect(getTaskTypeIcon(typeName).type).toBe(icon);
  });

  it("defaults to a 20px size and forwards a custom size", () => {
    expect(getTaskTypeIcon("Email").props).toMatchObject({
      width: 20,
      height: 20
    });
    expect(getTaskTypeIcon("Email", 32).props).toMatchObject({
      width: 32,
      height: 32
    });
  });
});

describe("getTaskTypeName", () => {
  const taskTypes: CrmTaskTypeRecord = {
    1: { id: 1, name: "Email", orderIndex: 0 }
  };

  it("resolves the name for a known typeId", () => {
    expect(getTaskTypeName(1, taskTypes)).toBe("Email");
  });

  it("returns undefined for an unknown typeId", () => {
    expect(getTaskTypeName(99, taskTypes)).toBeUndefined();
  });

  it("returns undefined when typeId itself is undefined", () => {
    expect(getTaskTypeName(undefined, taskTypes)).toBeUndefined();
  });
});

describe("isCrmTaskTab", () => {
  it("accepts every CrmTaskTabEnum value", () => {
    Object.values(CrmTaskTabEnum).forEach((value) => {
      expect(isCrmTaskTab(value)).toBe(true);
    });
  });

  it("rejects a value that is not a task tab", () => {
    expect(isCrmTaskTab("not a tab")).toBe(false);
  });
});

describe("getOwnerFullName", () => {
  it("returns an empty string when there is no owner", () => {
    expect(getOwnerFullName(undefined)).toBe("");
  });

  it("joins first and last name", () => {
    const owner: CrmOwnerEntity = {
      employeeId: 1,
      firstName: "Jane",
      lastName: "Doe"
    };
    expect(getOwnerFullName(owner)).toBe("Jane Doe");
  });

  it("falls back to just the first name when there is no last name", () => {
    const owner: CrmOwnerEntity = { employeeId: 1, firstName: "Jane" };
    expect(getOwnerFullName(owner)).toBe("Jane");
  });
});

describe("getChangedTaskFields", () => {
  const original: CrmTaskEntity = task(1, {
    name: "Original",
    notes: "Original notes",
    ownerId: 10
  });

  it("returns an empty diff when nothing changed", () => {
    expect(getChangedTaskFields(original, original)).toEqual({});
  });

  it("only includes fields that actually changed", () => {
    const changed: CrmTaskEntity = { ...original, ownerId: 20 };
    expect(getChangedTaskFields(changed, original)).toEqual({ ownerId: 20 });
  });

  it("trims name and notes", () => {
    const changed: CrmTaskEntity = {
      ...original,
      name: "  Renamed  ",
      notes: "  Updated notes  "
    };

    expect(getChangedTaskFields(changed, original)).toEqual({
      name: "Renamed",
      notes: "Updated notes"
    });
  });
});

describe("groupTaskIdsByDueDate", () => {
  it("buckets tasks into overdue / today / tomorrow / upcoming", () => {
    const tasks: CrmTaskRecord = {
      1: task(1, {
        dueAt: DateTime.local().minus({ days: 2 }).toUTC().toISO()
      }),
      2: task(2, { dueAt: DateTime.local().toUTC().toISO() }),
      3: task(3, {
        dueAt: DateTime.local().plus({ days: 1 }).toUTC().toISO()
      }),
      4: task(4, {
        dueAt: DateTime.local().plus({ days: 10 }).toUTC().toISO()
      }),
      5: task(5, { dueAt: undefined })
    };

    const result = groupTaskIdsByDueDate([1, 2, 3, 4, 5], tasks);

    expect(result.overdue).toEqual([1]);
    expect(result.dueToday).toEqual([2]);
    expect(result.dueTomorrow).toEqual([3]);
    expect(result.upcoming).toEqual(expect.arrayContaining([4, 5]));
    expect(result.isOpenTasksEmpty).toBe(false);
  });

  it("reports isOpenTasksEmpty when there are no ids to group", () => {
    expect(groupTaskIdsByDueDate([], {}).isOpenTasksEmpty).toBe(true);
  });
});

describe("getTaskGroups", () => {
  const tasks: CrmTaskRecord = {
    1: task(1, { ownerId: 10, isCompleted: false }),
    2: task(2, { ownerId: 20, isCompleted: false }),
    3: task(3, { ownerId: 10, isCompleted: true })
  };

  it("excludes completed tasks regardless of tab", () => {
    const result = getTaskGroups(
      [1, 2, 3],
      tasks,
      CrmTaskTabEnum.ALL_TASKS,
      undefined
    );

    expect([
      ...result.overdue,
      ...result.dueToday,
      ...result.dueTomorrow,
      ...result.upcoming
    ]).not.toContain(3);
  });

  it("restricts My Tasks to the current user's open tasks", () => {
    const result = getTaskGroups([1, 2, 3], tasks, CrmTaskTabEnum.MY_TASKS, 10);

    const visible = [
      ...result.overdue,
      ...result.dueToday,
      ...result.dueTomorrow,
      ...result.upcoming
    ];
    expect(visible).toContain(1);
    expect(visible).not.toContain(2);
    expect(visible).not.toContain(3);
  });

  it("does not filter by owner for the All Tasks tab", () => {
    const result = getTaskGroups(
      [1, 2, 3],
      tasks,
      CrmTaskTabEnum.ALL_TASKS,
      10
    );

    const visible = [
      ...result.overdue,
      ...result.dueToday,
      ...result.dueTomorrow,
      ...result.upcoming
    ];
    expect(visible).toContain(1);
    expect(visible).toContain(2);
  });
});
