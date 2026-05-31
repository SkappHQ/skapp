import { InputField, SearchIcon } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";

interface Props {
  inputValue: string;
  onSearchChange: (value: string) => void;
}

const DealsHeader: FC<Props> = ({ inputValue, onSearchChange }) => {
  const translateText = useTranslator("crmModule", "deals", "dealsTable");

  return (
    <div className="flex flex-col gap-4">
      <InputField
        placeholder={translateText(["searchPlaceholder"])}
        value={inputValue}
        onChange={(e) => onSearchChange(e.target.value)}
        type="search"
        variant="md"
        rightIcon={<SearchIcon />}
        ariaLabelClearButton={translateText(["clearSearchAriaLabel"])}
        customStyles={{ borderRadius: "rounded-[1.5rem]" }}
        className="w-103 h-12"
      />
    </div>
  );
};

export default DealsHeader;
