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

  const handleWrapperClick = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();

    if (!canComplete) event.preventDefault();
  };

  const handleChange = (checked: boolean) => {
    if (canComplete) onToggle(checked);
  };

  return (
    <div
      className={`shrink-0 flex items-center justify-center pr-1 ${
        canComplete ? "" : "opacity-50 **:cursor-not-allowed"
      } **:checked:bg-semantic-success! **:checked:border-semantic-success!`}
      onClick={handleWrapperClick}
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
          { subject }
        )}
      />
    </div>
  );
};

export default ActivityRowCheckbox;
