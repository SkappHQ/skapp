import { CheckTask } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";

interface ActivityRowCheckboxProps {
  id: string;
  subject: string;
  isCompleted: boolean;
  onToggle: (isCompleted: boolean) => void;
}

const ActivityRowCheckbox: FC<ActivityRowCheckboxProps> = ({
  id,
  subject,
  isCompleted,
  onToggle
}) => {
  const translateAria = useTranslator("crmAria");

  return (
    <div className="shrink-0 flex items-center justify-center pr-1 **:checked:bg-semantic-success! **:checked:border-semantic-success!">
      <CheckTask
        id={id}
        role="checkbox"
        checked={isCompleted}
        aria-checked={isCompleted}
        onChange={onToggle}
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
