import { Stack, SxProps, useTheme } from "@mui/material";
import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { ChangeEvent, FC, JSX } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import Pagination from "~community/common/components/atoms/Pagination/Pagination";
import Tooltip from "~community/common/components/atoms/Tooltip/Tooltip";
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
          <ButtonV2
            variant={"tertiary"}
            size={"md"}
            isLoading={exportBtn.isLoading}
            disabled={exportBtn.disabled}
            onClick={exportBtn.onClick}
            icon={<Icon name={IconName.DOWNLOAD_ICON} />}
            iconPosition="end"
          >
            {exportBtn.label}
          </ButtonV2>
        )}
        {exportBtn.toolTip?.text && <Tooltip title={exportBtn.toolTip?.text} />}
      </Stack>
    </Stack>
  );
};

export default TableFoot;
