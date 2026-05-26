import { InputField, SearchIcon } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
interface Props {
  inputValue: string;
  onSearchChange: (value: string) => void;
}

const DealsHeader: FC<Props> = ({ inputValue, onSearchChange }) => {
  const translateText = useTranslator("crmModule", "deals");

  return (
    <div className="flex flex-col gap-4">
      <InputField
        placeholder={translateText(["dealsTable", "searchPlaceholder"])}
        value={inputValue}
        onChange={(e) => onSearchChange(e.target.value)}
        type="search"
        variant="md"
        rightIcon={<SearchIcon />}
        ariaLabelClearButton={translateText([
          "dealsTable",
          "clearSearchAriaLabel"
        ])}
        customStyles={{
          borderRadius: "rounded-full",
          padding: "px-6",
          background: "bg-[#f4f4f5]",
          border: "border-0"
        }}
        className="max-w-[412px] w-full"
      />
    </div>
  );
};

export default DealsHeader;
