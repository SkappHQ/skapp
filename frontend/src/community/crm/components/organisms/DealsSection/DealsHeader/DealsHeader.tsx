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

const VIEW_OPTIONS = [
  { value: DealViewEnum.LIST, icon: <ListViewIcon />, ariaLabel: "List view" },
  { value: DealViewEnum.KANBAN, icon: <BoardIcon />, ariaLabel: "Kanban view" }
];

const DealsHeader: FC<Props> = ({
  inputValue,
  onSearchChange,
  activeView,
  onViewChange
}) => {
  const translateText = useTranslator("crmModule", "deals", "dealsTable");

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
        options={VIEW_OPTIONS}
        activeView={activeView}
        onChange={(v) => {
          const opt = VIEW_OPTIONS.find((o) => o.value === v);
          if (opt) onViewChange(opt.value);
        }}
        ariaLabel="Switch deal view"
      />
    </div>
  );
};

export default DealsHeader;
