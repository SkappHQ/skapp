import { Theme, useTheme } from "@mui/material";
import { CSSProperties, FC, JSX, useMemo } from "react";

export interface TableHeadActionRowProps {
  firstRow?: {
    leftButton?: JSX.Element;
    rightButton?: JSX.Element;
  };
  secondRow?: {
    leftButton?: JSX.Element;
    rightButton?: JSX.Element;
  };
  customStyles?: {
    wrapper?: CSSProperties;
    row?: CSSProperties;
  };
}

const TableActionToolbar: FC<TableHeadActionRowProps> = ({
  firstRow,
  secondRow,
  customStyles
}) => {
  const theme: Theme = useTheme();

  const isEnabled = useMemo(() => {
    return firstRow || secondRow;
  }, [firstRow, secondRow]);

  return firstRow || secondRow ? (
    <div
      style={{
        backgroundColor: theme.palette.grey[100],
        padding: "22px 12px 8px 12px"
      }}
    >
      {firstRow && (
        <div>
          <div>{firstRow.leftButton}</div>
          <div>{firstRow.rightButton}</div>
        </div>
      )}
      {secondRow && (
        <div>
          <div>{secondRow.leftButton}</div>
          <div>{secondRow.rightButton}</div>
        </div>
      )}
    </div>
  ) : (
    <></>
  );
};

export default TableActionToolbar;
