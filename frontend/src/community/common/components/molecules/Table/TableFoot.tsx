import { Stack, SxProps, useTheme } from "@mui/material";
import { ChangeEvent, FC, JSX } from "react";

import Button from "~community/common/components/atoms/Button/Button";
import Pagination from "~community/common/components/atoms/Pagination/Pagination";
import Tooltip from "~community/common/components/atoms/Tooltip/Tooltip";
import {
  ButtonSizes,
  ButtonStyle
} from "~community/common/enums/ComponentEnums";
import { IconName } from "~community/common/types/IconTypes";
import { mergeSx } from "~community/common/utils/commonUtil";

import { TableProps } from "./Table";
import styles from "./styles";

export interface TableFootProps {
  pagination?: {
    isEnabled?: boolean;
    disabled?: boolean;
    totalPages?: number;
    currentPage?: number;
    onChange?: (event: ChangeEvent<unknown>, value: number) => void;
  };
  exportBtn?: {
    label?: string;
    onClick?: () => void;
    disabled?: boolean;
    toolTip?: {
      text?: string;
    };
    styles?: {
      button?: SxProps;
    };
    isVisible?: boolean;
    isLoading?: boolean;
  };
  customElements?: {
    left?: JSX.Element;
    right?: JSX.Element;
  };
  customStyles?: {
    wrapper?: SxProps;
  };
}

const TableFoot: FC<TableProps & TableFootProps> = ({
  pagination = {
    disabled: false,
    isEnabled: true,
    totalPages: 1,
    currentPage: 0,
    onChange: () => {}
  },
  exportBtn = {
    label: "",
    disabled: false,
    onClick: () => {},
    toolTip: {
      text: ""
    },
    styles: {
      button: {}
    },
    isVisible: false
  },
  customElements,
  customStyles,
  tableName
}) => {
  const theme = useTheme();
  const classes = styles(theme);

  return (
    <Stack sx={mergeSx([classes?.tableFoot?.wrapper, customStyles?.wrapper])}>
      {pagination?.isEnabled && (
        <Pagination
          tableName={tableName}
          totalPages={pagination?.totalPages}
          currentPage={pagination?.currentPage || 0}
          onChange={pagination?.onChange || (() => {})}
          paginationStyles={classes?.tableFoot?.pagination}
          isDisabled={pagination?.disabled}
        />
      )}
      <Stack sx={classes.tableFoot?.exportBtn?.wrapper}>
        {customElements?.right && customElements.right}
        {exportBtn.isVisible && exportBtn.label && (
          <Button
            buttonStyle={ButtonStyle.TERTIARY_OUTLINED}
            size={ButtonSizes.MEDIUM}
            label={exportBtn.label}
            isFullWidth={false}
            isLoading={exportBtn.isLoading}
            disabled={exportBtn.disabled}
            styles={exportBtn.styles?.button}
            endIcon={IconName.DOWNLOAD_ICON}
            onClick={exportBtn.onClick}
          />
        )}
        {exportBtn.toolTip?.text && <Tooltip title={exportBtn.toolTip?.text} />}
      </Stack>
    </Stack>
  );
};

export default TableFoot;
