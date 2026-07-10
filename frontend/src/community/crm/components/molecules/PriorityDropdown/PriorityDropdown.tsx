import { Dropdown } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { CrmPriorityEnum } from "~community/crm/enums/common";
import useGetPriorityOptions from "~community/crm/hooks/useGetPriorityOptions";

interface PriorityDropdownProps {
  value: CrmPriorityEnum;
  onChange?: (value: CrmPriorityEnum) => void;
}

const PriorityDropdown: FC<PriorityDropdownProps> = ({ value, onChange }) => {
  const translateText = useTranslator("crmModule", "deals", "addDealSidePanel");
  const dropdownOptions = useGetPriorityOptions(translateText);

  const handleDropdownChange = (selectedValue: string) => {
    const priority = selectedValue as CrmPriorityEnum;
    onChange?.(priority);
  };

  return (
    <Dropdown
      value={value}
      onChange={handleDropdownChange}
      options={dropdownOptions}
      variant="jsx-content"
      menuWidth="content"
      height="min-h-8"
      width="100%"
      hideArrowIcon={true}
      padding="py-2 px-1"
      className="w-full bg-transparent border-0 rounded-lg hover:bg-tertiary-background focus:ring-0! focus:border-transparent!"
    />
  );
};

export default PriorityDropdown;
