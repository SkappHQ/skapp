import { CheckTask } from "@rootcodelabs/skapp-ui";
import { FC, KeyboardEvent, MouseEvent } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";

interface ActivityRowCheckboxProps {
  id: string;
  subject: string;
  isCompleted: boolean;
  canComplete: boolean;
  onToggle: (isCompleted: boolean) => void;
}

const ActivityRowCheckbox: FC<ActivityRowCheckboxProps> = ({
  id,
  subject,
  isCompleted,
  canComplete,
  onToggle
}) => {
  const translateAria = useTranslator("crmAria");

  const stopRowActivation = (
    event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>
  ) => {
    event.stopPropagation();
  };

  const handleChange = (checked: boolean) => {
    if (canComplete) onToggle(checked);
  };

  return (
    <div
      className={`shrink-0 flex items-center justify-center pr-1 ${
        canComplete ? "" : "opacity-50 **:cursor-not-allowed"
      }`}
      onClick={stopRowActivation}
      onKeyDown={stopRowActivation}
    >
      <CheckTask
        id={id}
        role="checkbox"
        checked={isCompleted}
        aria-checked={isCompleted}
        aria-disabled={!canComplete}
        readOnly={!canComplete}
        onChange={handleChange}
        aria-label={translateAria(
          [
            "activities",
            "row",
            isCompleted ? "markIncomplete" : "markComplete"
          ],
          { name: subject }
        )}
      />
    </div>
  );
};

export default ActivityRowCheckbox;
