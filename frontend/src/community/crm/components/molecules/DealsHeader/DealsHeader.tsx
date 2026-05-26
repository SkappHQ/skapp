import { ButtonV2, InputField, SearchIcon } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";

interface Props {
  inputValue: string;
  onSearchChange: (value: string) => void;
  onAddDeal?: () => void;
}

const DealsHeader: FC<Props> = ({ inputValue, onSearchChange, onAddDeal }) => {
  const translateText = useTranslator("crmModule", "deals");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{translateText(["title"])}</h1>
        <ButtonV2
          variant="primary"
          size="md"
          onClick={onAddDeal}
          icon={<Icon name={IconName.ADD_ICON} />}
          iconPosition="end"
        >
          {translateText(["addDealBtn"])}
        </ButtonV2>
      </div>
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
