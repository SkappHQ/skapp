import crmModule from "~community/common/assets/languages/english/crmModule.json";
import { ActivityTaskDetail } from "~community/crm/activities/types/activityTypes";
import { CrmPriorityEnum } from "~community/crm/enums/common";

import {
  canMarkTaskAsDone,
  canReopenTask,
  formatTaskDueDate,
  toTaskDueAt,
  toTaskDueDay,
  validateActivityTaskName,
  validateActivityTaskNotes
} from "../activityTaskUtil";

type TranslationNode = string | { [key: string]: TranslationNode };

const translate = (keys: string[]) =>
  String(
    keys.reduce<TranslationNode>(
      (node, key) => (typeof node === "string" ? node : node[key]),
      crmModule as TranslationNode
    )
  );

const buildTask = (
  overrides: Partial<ActivityTaskDetail>
): ActivityTaskDetail => ({
  id: 1,
  name: "Send contract",
  priority: CrmPriorityEnum.MEDIUM,
  dueAt: "2026-10-27T09:00:00Z",
  isCompleted: false,
  completedAt: null,
  notes: null,
  owner: null,
  contact: null,
  deal: null,
  company: null,
  canComplete: true,
  ...overrides
});

describe("validateActivityTaskName", () => {
  it("accepts a normal name", () => {
    expect(validateActivityTaskName("Send contract", translate)).toBe("");
  });

  it("requires a name", () => {
    expect(validateActivityTaskName("   ", translate)).toBe(
      "Task subject is required"
    );
  });

  it("limits the name to 255 characters", () => {
    expect(validateActivityTaskName("a".repeat(255), translate)).toBe("");
    expect(validateActivityTaskName("a".repeat(256), translate)).toBe(
      "Task name must be less than 255 characters"
    );
  });
});

describe("validateActivityTaskNotes", () => {
  it("accepts empty and normal notes", () => {
    expect(validateActivityTaskNotes("", translate)).toBe("");
    expect(validateActivityTaskNotes("Call back", translate)).toBe("");
  });

  it("limits notes to 1000 characters", () => {
    expect(validateActivityTaskNotes("a".repeat(1000), translate)).toBe("");
    expect(validateActivityTaskNotes("a".repeat(1001), translate)).toBe(
      "Notes must be less than 1000 characters"
    );
  });
});

describe("due date helpers", () => {
  it("formats the due date in the viewer's timezone", () => {
    expect(formatTaskDueDate("2026-10-27T09:00:00Z", "UTC")).toBe(
      "27th Oct 2026"
    );
    expect(formatTaskDueDate("2026-10-27T20:00:00Z", "Asia/Colombo")).toBe(
      "28th Oct 2026"
    );
  });

  it("turns a picked day into the start of that day in the viewer's timezone", () => {
    expect(toTaskDueAt(new Date(2026, 9, 27), "UTC")).toBe(
      "2026-10-27T00:00:00.000Z"
    );
    expect(toTaskDueAt(new Date(2026, 9, 27), "Asia/Colombo")).toBe(
      "2026-10-26T18:30:00.000Z"
    );
  });

  it("turns a due date back into the picked day", () => {
    const day = toTaskDueDay("2026-10-26T18:30:00Z", "Asia/Colombo");

    expect(day.getFullYear()).toBe(2026);
    expect(day.getMonth()).toBe(9);
    expect(day.getDate()).toBe(27);
  });
});

describe("completion permissions", () => {
  it("allows marking an open task as done only when it can be completed", () => {
    expect(canMarkTaskAsDone(buildTask({}))).toBe(true);
    expect(canMarkTaskAsDone(buildTask({ canComplete: false }))).toBe(false);
    expect(canMarkTaskAsDone(buildTask({ isCompleted: true }))).toBe(false);
  });

  it("allows reopening a completed task only when it can be completed", () => {
    expect(canReopenTask(buildTask({ isCompleted: true }))).toBe(true);
    expect(
      canReopenTask(buildTask({ isCompleted: true, canComplete: false }))
    ).toBe(false);
    expect(canReopenTask(buildTask({}))).toBe(false);
  });
});
