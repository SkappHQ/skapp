import { Box } from "@mui/material";
import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { MouseEvent, useState } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import MenuItem from "~community/common/components/atoms/MenuItem/MenuItem";
import Popper from "~community/common/components/molecules/Popper/Popper";
import { StyleProps } from "~community/common/types/CommonTypes";
import { IconName } from "~community/common/types/IconTypes";
import { MenuTypes } from "~community/common/types/MoleculeTypes";
import { mergeSx } from "~community/common/utils/commonUtil";

type Props<T> = {
  title: string;
  onItemClick: (event: MouseEvent<HTMLElement>, item: T) => void;
  items: T[];
  disabled?: boolean;
  selectedItem: T;
  displayKey?: keyof T;
  dropdownBtnStyles?: StyleProps;
  wrapperStyles?: StyleProps;
  position?: "bottom-start" | "bottom-end" | "top-start" | "top-end";
  buttonSize?: "sm" | "md" | "lg";
  ariaLabel?: string;
  ariaRole?: string;
};

const Dropdown = <T extends string | { [key: string]: any }>({
  title,
  items,
  onItemClick,
  disabled = false,
  selectedItem,
  displayKey,
  dropdownBtnStyles,
  wrapperStyles,
  position = "bottom-start",
  buttonSize = "md",
  ariaLabel = "dropdown-button",
  ariaRole
}: Props<T>) => {
  const [popperOpen, setPopperOpen] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleItemClick = (event: MouseEvent<HTMLElement>, item: T): void => {
    setAnchorEl(event.currentTarget);
    setPopperOpen((previousOpen) => !previousOpen);
    onItemClick(event, item);
  };

  const handleOpenClick = (event: MouseEvent<HTMLElement>): void => {
    setAnchorEl(event.currentTarget);
    setPopperOpen((previousOpen) => !previousOpen);
  };

  const getItemText = (item: T): string => {
    if (typeof item === "string") {
      return item;
    } else if (displayKey && typeof item[displayKey] === "string") {
      return item[displayKey] as string;
    }
    return "";
  };

  return (
    <Box sx={mergeSx([{ width: "100%" }, wrapperStyles])}>
      <ButtonV2
        variant={"tertiary"}
        size={buttonSize}
        onClick={handleOpenClick}
        disabled={disabled}
        aria-label={ariaLabel}
        icon={
          !disabled ? <Icon name={IconName.DROPDOWN_ARROW_ICON} /> : undefined
        }
        iconPosition="end"
      >
        {title}
      </ButtonV2>
      <Popper
        anchorEl={anchorEl}
        open={popperOpen}
        position={position}
        menuType={MenuTypes.SORT}
        id="dropdown-popper"
        ariaRole={ariaRole}
      >
        <Box sx={{ backgroundColor: "common.white" }}>
          {items.map((item, key) => (
            <MenuItem
              key={key}
              text={getItemText(item)}
              selected={item === selectedItem}
              onClick={(event) => {
                handleItemClick(event, item);
              }}
              id={`selectable-item-${key}`}
            />
          ))}
        </Box>
      </Popper>
    </Box>
  );
};

export default Dropdown;
