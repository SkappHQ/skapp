import { FC, useState } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import PriorityLabel from "~community/crm/v2/components/atoms/PriorityLabel/PriorityLabel";
import EditableCell from "~community/crm/v2/components/molecules/EditableCell/EditableCell";
import PriorityDropdown from "~community/crm/v2/components/molecules/PriorityDropdown/PriorityDropdown";
import { CrmPriorityEnum } from "~community/crm/v2/enums/common";

interface Props {
  priority?: CrmPriorityEnum;
  onSave: (priority: CrmPriorityEnum) => void;
}

const DealPriorityCell: FC<Props> = ({ priority, onSave }) => {
  const translateText = useTranslator("crmModule", "deals", "sidePanel");
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
      ariaLabel={translateText(["priority"])}
      onStartEditing={() => setIsEditing(true)}
      onClickOutside={() => setIsEditing(false)}
      display={<PriorityLabel priority={priority} showLabel />}
    >
      <PriorityDropdown
        value={priority ?? CrmPriorityEnum.MEDIUM}
        onChange={handleChange}
      />
    </EditableCell>
  );
};

export default DealPriorityCell;
