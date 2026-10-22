import { Dropdown, Label } from "@rootcodelabs/skapp-ui";
import { FC, createElement } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import {
  ACTIVITY_PRIORITY_KEYS,
  ACTIVITY_PRIORITY_ORDER,
  ACTIVITY_PRIORITY_STYLES
} from "~community/crm/activities/constants/activityConstants";
import { ACTIVITY_PRIORITY_ICON_MAP } from "~community/crm/activities/constants/activityIconConstants";
import { CrmPriorityEnum } from "~community/crm/enums/common";

interface ActivityTaskPriorityFieldProps {
  id: string;
  priority: CrmPriorityEnum;
  isEditable: boolean;
  onSave: (priority: CrmPriorityEnum) => void;
}

const ActivityTaskPriorityField: FC<ActivityTaskPriorityFieldProps> = ({
  id,
  priority,
  isEditable,
  onSave
}) => {
  const translateText = useTranslator("crmModule");
  const translateAria = useTranslator("crmAria");

  const renderLabel = (value: CrmPriorityEnum) => {
    const { backgroundColor, textColor } = ACTIVITY_PRIORITY_STYLES[value];

    return (
      <Label backgroundColor={backgroundColor} className="py-2 px-3">
        {createElement(ACTIVITY_PRIORITY_ICON_MAP[value])}
        <span className={`body3 ${textColor}`}>
          {translateText([
            "common",
            "priorityOptions",
            ACTIVITY_PRIORITY_KEYS[value]
          ])}
        </span>
      </Label>
    );
  };

  if (!isEditable) {
    return <span id={id}>{renderLabel(priority)}</span>;
  }

  const options = ACTIVITY_PRIORITY_ORDER.map((value) => ({
    id: ACTIVITY_PRIORITY_KEYS[value],
    value,
    label: renderLabel(value)
  }));

  return (
    <Dropdown
      id={id}
      value={priority}
      options={options}
      ariaLabel={translateAria(["activities", "taskPanel", "priority"])}
      onChange={(value: string) => {
        if (value !== priority) onSave(value as CrmPriorityEnum);
      }}
      variant="jsx-content"
      menuWidth="match"
      height="min-h-8"
      width="100%"
      hideArrowIcon
      padding="py-2 px-1"
      className="w-full bg-transparent border-none rounded-lg"
    />
  );
};

export default ActivityTaskPriorityField;
