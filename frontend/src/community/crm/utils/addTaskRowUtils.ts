import { KeyboardEvent } from "react";

import { TaskTypeValue } from "./crmTaskUtils";

export const handleAddTaskSave = (
  value: string,
  taskType: TaskTypeValue,
  onSave: (name: string, type: TaskTypeValue) => void,
  setValue: (v: string) => void
): void => {
  const trimmed = value.trim();
  if (!trimmed) return;
  onSave(trimmed, taskType);
  setValue("");
};

export const handleAddTaskKeyDown = (
  e: KeyboardEvent<HTMLInputElement>,
  onSaveAction: () => void,
  onCancelAction: () => void
): void => {
  if (e.key === "Enter") {
    e.preventDefault();
    onSaveAction();
  } else if (e.key === "Escape") {
    e.preventDefault();
    onCancelAction();
  }
};
