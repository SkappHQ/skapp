import { Stack, SxProps, useTheme } from "@mui/material";
import { ChangeEvent, FC, JSX } from "react";

import Button from "~community/common/components/atoms/Button/Button";
import Pagination from "~community/common/components/atoms/Pagination/Pagination";
import Tooltip from "~community/common/components/atoms/Tooltip/Tooltip";
import {
  ButtonSizes,
  ButtonStyle
} from "~community/common/enums/ComponentEnums";
import { TableTypes } from "~community/common/types/CommonTypes";
import { IconName } from "~community/common/types/IconTypes";
import { mergeSx } from "~community/common/utils/commonUtil";

import styles from "./styles";

export interface TableFootProps {
  pagination?: {
    isEnabled?: boolean;
    totalPages?: number;
    currentPage?: number;
    onChange?: (event: ChangeEvent<unknown>, value: number) => void;
  };
  exportBtn?: {
    label?: string;
    onClick?: () => void;
    toolTip?: {
      text?: string;
    };
    styles?: {
      button?: SxProps;
    };
    isVisible?: boolean;
  };
  customElements?: {
    left?: JSX.Element;
    right?: JSX.Element;
  };
  customStyles?: {
    wrapper?: SxProps;
  };
}

const TableFoot: FC<TableTypes & TableFootProps> = ({
  tableName,
  pagination = {
    isEnabled: true,
    totalPages: 1,
    currentPage: 0,
    onChange: () => {}
  },
  exportBtn = {
    label: "",
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
  customStyles
}) => {
  const theme = useTheme();
  const classes = styles(theme);

  return (
    <Stack
      sx={mergeSx([classes?.tableFoot?.wrapper, customStyles?.wrapper])}
      role="region"
      aria-label={`${tableName}-table-foot`}
    >
      {pagination?.isEnabled && (
        <Pagination
          totalPages={pagination?.totalPages}
          currentPage={pagination?.currentPage || 0}
          onChange={pagination?.onChange || (() => {})}
          paginationStyles={classes?.tableFoot?.pagination}
          aria-label={`${tableName}-table-foot-pagination`}
        />
      )}
      <Stack
        sx={classes.tableFoot?.exportBtn?.wrapper}
        role="region"
        aria-label={`${tableName}-table-foot-export-button-wrapper`}
      >
        {customElements?.right && customElements.right}
        {exportBtn.isVisible && exportBtn.label && (
          <Button
            buttonStyle={ButtonStyle.TERTIARY_OUTLINED}
            size={ButtonSizes.MEDIUM}
            label={exportBtn.label}
            isFullWidth={false}
            styles={exportBtn.styles?.button}
            endIcon={IconName.DOWNLOAD_ICON}
            onClick={exportBtn.onClick}
            aria-label={`${tableName}-table-foot-export-button`}
          />
        )}
        {exportBtn.toolTip?.text && (
          <Tooltip
            title={exportBtn.toolTip?.text}
            aria-label={`${tableName}-table-foot-export-button-tooltip`}
          />
        )}
      </Stack>
    </Stack>
  );
};

export default TableFoot;
