import { FC } from "react";

import { InputField, SearchIcon } from "@rootcodelabs/skapp-ui";

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
        customStyles={{
          borderRadius: "rounded-full",
          padding: "px-6",
          background: "bg-secondary-background",
          border: "border-0"
        }}
        className="max-w-[412px] w-full"
      />
    </div>
  );
};

export default DealsHeader;
