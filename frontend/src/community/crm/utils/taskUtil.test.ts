import { DateTime } from "luxon";

import { CrmPriorityEnum, CrmTaskGroupEnum } from "~community/crm/enums/common";
import { CrmTaskDetailType } from "~community/crm/types/CommonTypes";

import {
  getDueDateStatus,
  replaceTaskGroup,
  setTaskCompletionInList
} from "./taskUtil";

jest.mock("@rootcodelabs/skapp-ui", () => ({}), { virtual: true });

const makeTask = (
  id: number,
  isCompleted: boolean,
  overrides: Partial<CrmTaskDetailType> = {}
): CrmTaskDetailType => ({
  id,
  name: `Task ${id}`,
  typeId: 1,
  typeName: "CALL",
  priority: CrmPriorityEnum.MEDIUM,
  isCompleted,
  dueAt: null,
  notes: null,
  contactId: null,
  owner: { employeeId: 1, firstName: "Owner", lastName: "User", authPic: null },
  contact: null,
  deal: null,
  ...overrides
});

describe("getDueDateStatus", () => {
  it("returns null when dueAt is null", () => {
    expect(getDueDateStatus(null, false)).toBeNull();
  });

  it("returns an overdue status with dayCount >= 1 for a task several days past due", () => {
    const dueAt = DateTime.local()
      .minus({ days: 3 })
      .set({ hour: 15 })
      .toUTC()
      .toISO();

    const result = getDueDateStatus(dueAt, false);

    expect(result?.textKey).toBe("dueDateOverdue");
    expect(result?.dayCount).toBeGreaterThanOrEqual(1);
  });

  it("returns dayCount of 1 for a task due exactly yesterday, regardless of time of day", () => {
    const dueAt = DateTime.local()
      .minus({ days: 1 })
      .set({ hour: 23, minute: 0 })
      .toUTC()
      .toISO();

    const result = getDueDateStatus(dueAt, false);

    expect(result?.textKey).toBe("dueDateOverdue");
    expect(result?.dayCount).toBe(1);
  });

  it("omits dayCount when the task is due today", () => {
    const dueAt = DateTime.local().toUTC().toISO();

    const result = getDueDateStatus(dueAt, false);

    expect(result?.textKey).toBe("dueDateToday");
    expect(result?.dayCount).toBeUndefined();
  });

  it("omits dayCount when the task is due in the future", () => {
    const dueAt = DateTime.local().plus({ days: 5 }).toUTC().toISO();

    const result = getDueDateStatus(dueAt, false);

    expect(result?.textKey).toBe("dueDateDueOn");
    expect(result?.dayCount).toBeUndefined();
  });

  it("returns a due-on status instead of overdue for a completed task", () => {
    const dueAt = DateTime.local().minus({ days: 3 }).toUTC().toISO();

    const result = getDueDateStatus(dueAt, true);

    expect(result?.textKey).toBe("dueDateDueOn");
    expect(result?.dayCount).toBeUndefined();
  });
});

describe("setTaskCompletionInList", () => {
  it("flips only the matching task's completion flag", () => {
    const list = [makeTask(1, false), makeTask(2, false)];
    const result = setTaskCompletionInList(list, 2, true);

    expect(result[0].isCompleted).toBe(false);
    expect(result[1].isCompleted).toBe(true);
  });

  it("leaves the list unchanged in value when no task matches", () => {
    const list = [makeTask(1, false)];
    const result = setTaskCompletionInList(list, 99, true);

    expect(result).toEqual(list);
  });
});

describe("replaceTaskGroup", () => {
  it("replaces the open group and keeps the completed group", () => {
    const store = [makeTask(1, false), makeTask(9, true)];
    const fresh = [makeTask(2, false), makeTask(3, false)];

    const result = replaceTaskGroup(store, fresh, CrmTaskGroupEnum.OPEN);

    // kept completed (9), then fresh open (2, 3)
    expect(result.map((task) => task.id)).toEqual([9, 2, 3]);
    expect(result.find((task) => task.id === 9)?.isCompleted).toBe(true);
  });

  it("replaces the completed group and keeps the open group", () => {
    const store = [makeTask(1, false), makeTask(9, true)];
    const fresh = [makeTask(8, true), makeTask(7, true)];

    const result = replaceTaskGroup(store, fresh, CrmTaskGroupEnum.COMPLETED);

    // kept open (1), then fresh completed (8, 7)
    expect(result.map((task) => task.id)).toEqual([1, 8, 7]);
  });

  it("clears the open group when the fresh open list is empty (e.g. no search matches)", () => {
    const store = [makeTask(1, false), makeTask(9, true)];

    const result = replaceTaskGroup(store, [], CrmTaskGroupEnum.OPEN);

    expect(result.map((task) => task.id)).toEqual([9]);
  });
});
