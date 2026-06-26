import {
  Pagination as MuiPagination,
  PaginationItem,
  type PaginationRenderItemParams,
  Theme,
  useTheme
} from "@mui/material";
import { type SxProps } from "@mui/system";
import { ChangeEvent, FC, JSX } from "react";

import { useMediaQuery } from "~community/common/hooks/useMediaQuery";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { mergeSx } from "~community/common/utils/commonUtil";

import { TableProps } from "../../molecules/Table/Table";
import styles from "./styles";

interface Props {
  totalPages?: number;
  onChange: (event: ChangeEvent<unknown>, value: number) => void;
  currentPage: number;
  paginationStyles?: SxProps<Theme>;
  isDisabled?: boolean;
  isNumbersVisible?: boolean;
}

const Pagination: FC<TableProps & Props> = ({
  totalPages = 1,
  onChange,
  currentPage,
  paginationStyles,
  isDisabled = false,
  isNumbersVisible = true,
  tableName
}): JSX.Element => {
  const queryMatches = useMediaQuery();
  const isBelow1280 = queryMatches(1280);

  const translateAria = useTranslator("commonAria", "components", "pagination");

  const theme = useTheme();
  const classes = styles(theme);

  const renderPaginationItem = (item: PaginationRenderItemParams) =>
    item.type === "page" ? null : <PaginationItem {...item} />;

  return (
    <MuiPagination
      aria-label={`${tableName} ${translateAria(["label"])}`}
      count={totalPages}
      variant="outlined"
      boundaryCount={isBelow1280 ? 0 : 1}
      onChange={onChange}
      size={isBelow1280 ? "small" : "medium"}
      page={currentPage + 1}
      shape="rounded"
      disabled={isDisabled}
      renderItem={isNumbersVisible ? undefined : renderPaginationItem}
      sx={mergeSx([classes.pagination, paginationStyles])}
    />
  );
};

export default Pagination;
