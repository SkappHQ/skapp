import { DateTime } from "luxon";

import { getDueDateStatus } from "./taskUtil";

jest.mock("@rootcodelabs/skapp-ui", () => ({}), { virtual: true });

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
