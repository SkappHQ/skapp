import { Theme, useTheme } from "@mui/material";
import { CSSProperties, ChangeEvent, FC, JSX } from "react";


import { IconName } from "~community/common/types/IconTypes";

import { Button } from "@rootcodelabs/skapp-ui";
import Icon from "~community/common/components/atoms/Icon/Icon";
import Pagination from "../../atoms/Pagination/Pagination";
import { CommonTableProps } from "./Table";
import TableDataCell from "./TableDataCell";

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
      button?: CSSProperties;
    };
    isVisible?: boolean;
    isLoading?: boolean;
  };
  customElements?: {
    left?: JSX.Element;
    right?: JSX.Element;
  };
  customStyles?: {
    wrapper?: CSSProperties;
  };
}

const TableFoot: FC<TableFootProps & CommonTableProps> = ({
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
  headers
}) => {
  const theme: Theme = useTheme();

  return (
    <tfoot
      style={{
        backgroundColor: theme.palette.grey[100],
        height: "88px",
        width: "100%"
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "24px 16px"
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
            width: "100%"
          }}
        >
          {customElements?.left && customElements.left}
          {pagination?.isEnabled && (
            <Pagination
              totalPages={pagination?.totalPages}
              currentPage={pagination?.currentPage || 0}
              onChange={pagination?.onChange || (() => {})}
              paginationStyles={{
                margin: "0rem"
              }}
              isDisabled={pagination?.disabled}
            />
          )}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            width: "100%"
          }}
        >
          {customElements?.right && customElements.right}
          {exportBtn.isVisible && exportBtn.label && (
            <Button variant={"tertiary"} size={"sm"} fullWidth={false} isLoading={exportBtn.isLoading} disabled={exportBtn.disabled} onClick={exportBtn.onClick} icon={<Icon name={IconName.DOWNLOAD_ICON} />} iconPosition="end">{exportBtn.label}</Button>
          )}
        </div>
      </div>
    </tfoot>
  );
};

export default TableFoot;
