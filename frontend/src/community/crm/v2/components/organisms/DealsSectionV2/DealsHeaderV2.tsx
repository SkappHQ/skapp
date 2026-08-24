import {
  BoardIcon,
  InputField,
  ListViewIcon,
  SearchIcon,
  ViewToggle
} from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { DealViewEnum } from "~community/crm/v2/enums/common";

interface Props {
  inputValue: string;
  onSearchChange: (value: string) => void;
  activeView: DealViewEnum;
  onViewChange: (view: DealViewEnum) => void;
}

const DealsHeaderV2: FC<Props> = ({
  inputValue,
  onSearchChange,
  activeView,
  onViewChange
}) => {
  const translateText = useTranslator("crmModule", "deals", "dealsTable");

  const handleViewChange = (view: string) => onViewChange(view as DealViewEnum);

  const viewOptions = [
    {
      value: DealViewEnum.KANBAN,
      icon: <BoardIcon />,
      ariaLabel: translateText(["kanbanViewAriaLabel"])
    },
    {
      value: DealViewEnum.LIST,
      icon: <ListViewIcon />,
      ariaLabel: translateText(["listViewAriaLabel"])
    }
  ];

  return (
    <div className="flex items-center justify-between gap-4">
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
      <ViewToggle
        options={viewOptions}
        activeView={activeView}
        onChange={handleViewChange}
        ariaLabel={translateText(["switchDealViewAriaLabel"])}
      />
    </div>
  );
};

export default DealsHeaderV2;
