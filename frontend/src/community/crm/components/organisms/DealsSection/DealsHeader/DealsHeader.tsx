import {
  BoardIcon,
  InputField,
  ListViewIcon,
  SearchIcon,
  ViewToggle
} from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { DealViewEnum } from "~community/crm/enums/common";

export type DealView = DealViewEnum;

interface Props {
  inputValue: string;
  onSearchChange: (value: string) => void;
  activeView: DealView;
  onViewChange: (view: DealView) => void;
}

const DealsHeader: FC<Props> = ({
  inputValue,
  onSearchChange,
  activeView,
  onViewChange
}) => {
  const translateText = useTranslator("crmModule", "deals", "dealsTable");

  const viewOptions = [
    {
      value: DealViewEnum.LIST,
      icon: <ListViewIcon />,
      ariaLabel: translateText(["listViewAriaLabel"])
    },
    {
      value: DealViewEnum.KANBAN,
      icon: <BoardIcon />,
      ariaLabel: translateText(["kanbanViewAriaLabel"])
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
        onChange={(v) => onViewChange(v as DealView)}
        ariaLabel={translateText(["switchDealViewAriaLabel"])}
      />
    </div>
  );
};

export default DealsHeader;
