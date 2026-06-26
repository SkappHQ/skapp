import { SxProps, TableCell, Theme, useTheme } from "@mui/material";
import { FC } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import IconButton from "~community/common/components/atoms/IconButton/IconButton";
import { IconName } from "~community/common/types/IconTypes";
import { mergeSx } from "~community/common/utils/commonUtil";

import styles from "./styles";

export interface TableBodyActionColumnProps {
  isEnabled?: boolean;
  actionBtns?: {
    left?: {
      iconName?: IconName;
      width?: string;
      height?: string;
      styles?: SxProps<Theme>;
      onClick: (data: any) => void;
      accessibility?: {
        rowKey?: string;
      };
    };
    right?: {
      iconName?: IconName;
      width?: string;
      height?: string;
      styles?: SxProps<Theme>;
      onClick: (data: any) => void;
      accessibility?: {
        rowKey?: string;
      };
    };
  };
}

export interface TableRowDataProps {
  isRowDisabled?: (row: any) => boolean;
  row: any;
}

const DELETE_BUTTON_ICON_WIDTH = "10";
const DELETE_BUTTON_ICON_HEIGHT = "12";

const TableBodyActionColumn: FC<
  TableBodyActionColumnProps & TableRowDataProps
> = ({ row, isEnabled = false, actionBtns, isRowDisabled }) => {
  const theme: Theme = useTheme();
  const classes = styles(theme);

  return (
    isEnabled && (
      <TableCell sx={mergeSx([classes.tableBody.actionColumn.cell])}>
        {actionBtns?.left && (
          <IconButton
            icon={
              <Icon
                name={actionBtns?.left?.iconName ?? IconName.EDIT_ICON}
                width={actionBtns?.left?.width}
                height={actionBtns?.left?.height}
              />
            }
            hoverEffect={false}
            buttonStyles={mergeSx([
              classes.tableBody.actionColumn.icons.left,
              actionBtns?.left.styles
            ])}
            disabled={isRowDisabled?.(row.id)}
            onClick={() => actionBtns?.left?.onClick(row.actionData)}
            ariaLabel={row?.ariaLabel?.editButton ?? ""}
            ariaDescription={row?.ariaDescription?.editButton ?? ""}
          />
        )}
        {actionBtns?.right && (
          <IconButton
            icon={
              <Icon
                name={
                  actionBtns?.right?.iconName ?? IconName.DELETE_BUTTON_ICON
                }
                width={actionBtns?.right?.width ?? DELETE_BUTTON_ICON_WIDTH}
                height={actionBtns?.right?.height ?? DELETE_BUTTON_ICON_HEIGHT}
              />
            }
            hoverEffect={false}
            buttonStyles={mergeSx([
              classes.tableBody.actionColumn.icons.right,
              actionBtns?.right.styles
            ])}
            disabled={isRowDisabled?.(row.id)}
            onClick={() => actionBtns?.right?.onClick(row.actionData)}
            ariaLabel={row?.ariaLabel?.deleteButton ?? ""}
            ariaDescription={row?.ariaDescription?.deleteButton ?? ""}
          />
        )}
      </TableCell>
    )
  );
};

export default TableBodyActionColumn;
