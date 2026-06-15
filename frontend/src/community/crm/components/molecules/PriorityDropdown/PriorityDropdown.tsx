import { Dropdown } from "@rootcodelabs/skapp-ui";
import React, { useEffect, useState } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { CrmPriorityEnum } from "~community/crm/enums/common";
import useGetPriorityOptions from "~community/crm/hooks/useGetPriorityOptions";

interface PriorityDropdownProps {
  value?: CrmPriorityEnum;
  onChange?: (value: CrmPriorityEnum) => void;
  onSave?: (value: CrmPriorityEnum) => void;
}

const PriorityDropdown: React.FC<PriorityDropdownProps> = ({
  value = CrmPriorityEnum.MEDIUM,
  onChange,
  onSave
}) => {
  const translateText = useTranslator("crmModule", "deals", "addDealSidePanel");
  const dropdownOptions = useGetPriorityOptions(translateText);
  const [inputValue, setInputValue] = useState<CrmPriorityEnum>(value);

  useEffect(() => {
    setInputValue(value || CrmPriorityEnum.MEDIUM);
  }, [value]);

  const handleDropdownChange = (selectedValue: string) => {
    const priority = selectedValue as CrmPriorityEnum;
    setInputValue(priority);
    onChange?.(priority);
    onSave?.(priority);
  };

  return (
    <Dropdown
      value={inputValue}
      onChange={handleDropdownChange}
      options={dropdownOptions}
      variant="jsx-content"
      width="auto"
      menuWidth="content"
      usePortal={false}
      height="min-h-8"
      hideArrowIcon={true}
      padding="py-2 px-1"
      className="bg-transparent! border-0! rounded-lg hover:bg-gray-50! transition-colors"
    />
  );
};

export default PriorityDropdown;
