import { FC, useEffect, useRef, useState } from "react";

import EnterKeyIcon from "~community/common/assets/Icons/EnterKeyIcon";
import TaskTypeSelector from "~community/crm/components/atoms/TaskTypeSelector/TaskTypeSelector";
import {
  handleAddTaskKeyDown,
  handleAddTaskSave
} from "~community/crm/utils/addTaskRowUtils";
import { TaskTypeValue } from "~community/crm/utils/crmTaskUtils";

import styles from "./styles";

interface Props {
  onSave: (name: string, type: TaskTypeValue) => void;
  onCancel: () => void;
  placeholder?: string;
  hasBorder?: boolean;
}

const AddTaskRow: FC<Props> = ({
  onSave,
  onCancel,
  placeholder = "Type a task name…",
  hasBorder = true
}) => {
  const [taskType, setTaskType] = useState<TaskTypeValue>("email");
  const [value, setValue] = useState("");
  const rowRef = useRef<HTMLDivElement>(null);

  const handleSave = () => handleAddTaskSave(value, taskType, onSave, setValue);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) =>
    handleAddTaskKeyDown(e, handleSave, onCancel);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        rowRef.current &&
        !rowRef.current.contains(target) &&
        !target.closest('[role="listbox"]')
      ) {
        onCancel();
      }
    };
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [onCancel]);

  return (
    <div
      ref={rowRef}
      className={`${styles.row} ${hasBorder ? styles.rowBorder : ""}`}
    >
      <div className={styles.inner}>
        {/* Type selector pill */}
        <div className={styles.typeSelectorWrapper}>
          <TaskTypeSelector value={taskType} onChange={setTaskType} />
        </div>

        {/* Input + submit button */}
        <div className={styles.inputWrapper}>
          <input
            autoFocus
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={styles.input}
          />
          <button
            type="button"
            disabled={!value.trim()}
            onClick={handleSave}
            className={styles.submitBtn}
            aria-label="Add task"
          >
            <span className="overflow-hidden relative shrink-0 size-4">
              <span className="absolute top-1/4 bottom-[29.14%] left-[16.69%] right-[16.67%]">
                <EnterKeyIcon width="100%" height="100%" />
              </span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddTaskRow;
