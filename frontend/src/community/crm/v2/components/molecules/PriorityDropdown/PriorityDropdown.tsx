import { Dropdown } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import useGetPriorityOptions from "~community/crm/hooks/useGetPriorityOptions";
import { CrmPriorityEnum } from "~community/crm/v2/enums/common";

interface PriorityDropdownProps {
  value: CrmPriorityEnum;
  onChange?: (value: CrmPriorityEnum) => void;
}

const PriorityDropdown: FC<PriorityDropdownProps> = ({ value, onChange }) => {
  const translateText = useTranslator("crmModule", "deals", "addDealSidePanel");
  const dropdownOptions = useGetPriorityOptions(translateText);

  const handleDropdownChange = (selectedValue: string) => {
    onChange?.(selectedValue as CrmPriorityEnum);
  };

  return (
    <Dropdown
      value={value}
      onChange={handleDropdownChange}
      options={dropdownOptions}
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

export default PriorityDropdown;
