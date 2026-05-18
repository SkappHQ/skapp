import { SubTaskInput } from "@rootcodelabs/skapp-ui";
import { FC, useState } from "react";

import TaskTypeSelector from "~community/crm/components/atoms/TaskTypeSelector/TaskTypeSelector";
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

  return (
    <div className={`${styles.wrapper} ${hasBorder ? styles.border : ""}`}>
      <SubTaskInput
        prefixNode={
          <TaskTypeSelector value={taskType} onChange={setTaskType} />
        }
        placeholder={placeholder}
        onSave={(name) => onSave(name, taskType)}
        onCancel={onCancel}
      />
    </div>
  );
};

export default AddTaskRow;
