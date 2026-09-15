import { FC, useState } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import PriorityDropdown from "~community/crm/v2/components/molecules/PriorityDropdown/PriorityDropdown";
import { CrmPriorityEnum } from "~community/crm/v2/enums/common";
import { useGetPriorityOptions } from "~community/crm/v2/hooks/useGetPriorityOptions";

import EditableCell from "./EditableCell";

interface Props {
  priority?: CrmPriorityEnum;
  onSave: (priority: CrmPriorityEnum) => void;
}

const DealPriorityCell: FC<Props> = ({ priority, onSave }) => {
  const translateText = useTranslator("crmModule", "deals", "dealsTable");
  const [isEditing, setIsEditing] = useState(false);
  const priorityOptions = useGetPriorityOptions();

  const selectedOption = priorityOptions.find(
    (option) => option.value === priority
  );

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
      display={selectedOption?.label ?? <span className="body2">-</span>}
    >
      <PriorityDropdown
        value={priority ?? CrmPriorityEnum.MEDIUM}
        onChange={handleChange}
      />
    </EditableCell>
  );
};

export default DealPriorityCell;
