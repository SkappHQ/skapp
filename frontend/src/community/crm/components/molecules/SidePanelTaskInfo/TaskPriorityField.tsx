import { Label } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { CrmPriorityEnum } from "~community/crm/enums/common";
import {
  getPriorityConfig,
  getPriorityDisplayKey
} from "~community/crm/utils/taskUtil";

interface Props {
  priority: CrmPriorityEnum;
  label: string;
  translateText: (keys: string[]) => string;
}

const TaskPriorityField: FC<Props> = ({
  priority,
  label,
  translateText
}) => {
  const priorityConfig = getPriorityConfig(priority);

  return (
    <div className="flex flex-1 items-center justify-between w-full">
      <span className="subtitle3 text-secondary-text whitespace-nowrap">
        {label}
      </span>
      <div className="flex items-center">
        <Label
          backgroundColor={priorityConfig.bgColor}
          textColor={priorityConfig.textColor}
        >
          {translateText([
            "priorityOptions",
            getPriorityDisplayKey(priority)
          ])}
        </Label>
      </div>
    </div>
  );
};

export default TaskPriorityField;
