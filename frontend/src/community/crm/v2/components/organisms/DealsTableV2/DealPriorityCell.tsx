import { FC, useState } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import PriorityDropdown from "~community/crm/v2/components/molecules/PriorityDropdown/PriorityDropdown";
import PriorityLabel from "~community/crm/v2/components/molecules/PriorityLabel/PriorityLabel";
import { CrmPriorityEnum } from "~community/crm/v2/enums/common";
import { getPriorityConfig } from "~community/crm/v2/utils/priorityUtil";

import EditableCell from "./EditableCell";

interface Props {
  priority?: CrmPriorityEnum;
  onSave: (priority: CrmPriorityEnum) => void;
}

const DealPriorityCell: FC<Props> = ({ priority, onSave }) => {
  const translateText = useTranslator("crmModule", "deals", "dealsTable");
  const translatePriority = useTranslator(
    "crmModule",
    "common",
    "priorityOptions"
  );
  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (value: CrmPriorityEnum): void => {
    setIsEditing(false);
    if (value !== priority) {
      onSave(value);
    }
  };

  return (
    <EditableCell
      isEditing={isEditing}
      ariaLabel={translateText(["inlineEdit", "ariaLabels", "priority"])}
      onStartEditing={() => setIsEditing(true)}
      onClickOutside={() => setIsEditing(false)}
      display={
        priority ? (
          <PriorityLabel
            priority={priority}
            label={translatePriority([getPriorityConfig(priority).key])}
          />
        ) : (
          <span className="body2">-</span>
        )
      }
    >
      <PriorityDropdown
        value={priority ?? CrmPriorityEnum.MEDIUM}
        onChange={handleChange}
      />
    </EditableCell>
  );
};

export default DealPriorityCell;
