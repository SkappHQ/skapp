import { CrmTaskRecord } from "~community/crm/v2/types/CrmCommonTypes";

import { removeTaskFromRecord, removeTaskId } from "../taskUtil";

describe("removeTaskId", () => {
  it("removes the id when it is present", () => {
    expect(removeTaskId([1, 2, 3], 2)).toEqual([1, 3]);
  });

  it("returns the remaining ids unchanged when the id is absent", () => {
    expect(removeTaskId([1, 2, 3], 99)).toEqual([1, 2, 3]);
  });

  it("does not mutate the input array", () => {
    const taskIds = [1, 2, 3];

    removeTaskId(taskIds, 2);

    expect(taskIds).toEqual([1, 2, 3]);
  });

  it("removes every occurrence of the id", () => {
    expect(removeTaskId([1, 2, 2, 3], 2)).toEqual([1, 3]);
  });
});

describe("removeTaskFromRecord", () => {
  const buildTasks = (): CrmTaskRecord => ({
    1: { id: 1, name: "Call the contact" },
    2: { id: 2, name: "Send the proposal" }
  });

  it("removes the task when it is present", () => {
    expect(removeTaskFromRecord(buildTasks(), 1)).toEqual({
      2: { id: 2, name: "Send the proposal" }
    });
  });

  it("returns the record unchanged when the id is absent", () => {
    expect(removeTaskFromRecord(buildTasks(), 99)).toEqual(buildTasks());
  });

  it("does not mutate the input record", () => {
    const tasks = buildTasks();

    removeTaskFromRecord(tasks, 1);

    expect(tasks).toEqual(buildTasks());
  });

  it("sweeps the removed id out of other tasks' relatedTaskIds", () => {
    const tasks: CrmTaskRecord = {
      1: { id: 1, name: "Call the contact" },
      2: { id: 2, name: "Send the proposal", relatedTaskIds: [1, 3] }
    };

    expect(removeTaskFromRecord(tasks, 1)).toEqual({
      2: { id: 2, name: "Send the proposal", relatedTaskIds: [3] }
    });
  });

  it("leaves tasks untouched when they do not reference the removed id", () => {
    const tasks: CrmTaskRecord = {
      1: { id: 1, name: "Call the contact" },
      2: { id: 2, name: "Send the proposal", relatedTaskIds: [3] }
    };

    expect(removeTaskFromRecord(tasks, 1)[2]).toBe(tasks[2]);
  });
});
