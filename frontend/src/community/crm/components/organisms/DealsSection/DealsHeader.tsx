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

interface Props {
  inputValue: string;
  onSearchChange: (value: string) => void;
  activeView: DealViewEnum;
  onViewChange: (view: DealViewEnum) => void;
}

const DealsHeader: FC<Props> = ({
  inputValue,
  onSearchChange,
  activeView,
  onViewChange
}) => {
  const translateText = useTranslator("crmModule");
  const translateAria = useTranslator("crmAria");

  const handleViewChange = (view: string) => onViewChange(view as DealViewEnum);

  const viewOptions = [
    {
      value: DealViewEnum.KANBAN,
      icon: <BoardIcon />,
      ariaLabel: translateAria(["deals", "header", "kanbanView"])
    },
    {
      value: DealViewEnum.LIST,
      icon: <ListViewIcon />,
      ariaLabel: translateAria(["deals", "header", "listView"])
    }
  ];

  return (
    <div className="flex items-center justify-between gap-4">
      <InputField
        placeholder={translateText(["deals", "header", "searchPlaceholder"])}
        value={inputValue}
        onChange={(e) => onSearchChange(e.target.value)}
        type="search"
        variant="md"
        rightIcon={<SearchIcon />}
        ariaLabelClearButton={translateAria(["deals", "header", "clearSearch"])}
        customStyles={{ borderRadius: "rounded-[1.5rem]" }}
        className="w-103 h-12"
      />
      <ViewToggle
        options={viewOptions}
        activeView={activeView}
        onChange={handleViewChange}
        ariaLabel={translateAria(["deals", "header", "switchDealView"])}
      />
    </div>
  );
};

export default DealsHeader;
