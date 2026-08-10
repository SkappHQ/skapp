import { ProjectTableSkeletonLoader, SearchIcon } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import TableView from "~community/common/components/organisms/TableView/TableView";
import type {
  GridHeader,
  GridRow,
  TableViewFilter,
  TableViewProps
} from "~community/common/components/organisms/TableView/types";

const SKELETON_ROW_COUNT = 8;

interface Props {
  headers: GridHeader[];
  rows: GridRow[];
  isLoading: boolean;
  emptyFilterState: boolean;
  translateText: (keys: string[], params?: Record<string, unknown>) => string;
  scrollHeight: string;
  hasNextPage?: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
  onRowClick: (row: GridRow) => void;
  toolbar: TableViewProps["toolbar"];
  filter?: TableViewFilter;
}

const CrmTableView: FC<Props> = ({
  headers,
  rows,
  isLoading,
  emptyFilterState,
  translateText,
  scrollHeight,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  onRowClick,
  toolbar,
  filter
}) => (
  <TableView
    headers={headers}
    rows={rows}
    isLoading={isLoading}
    loader={<ProjectTableSkeletonLoader rowCount={SKELETON_ROW_COUNT} />}
    emptyState={{
      icon: <SearchIcon />,
      title: emptyFilterState
        ? translateText(["table", "emptySearchState", "title"])
        : translateText(["table", "emptyDataState", "title"]),
      description: emptyFilterState
        ? translateText(["table", "emptySearchState", "description"])
        : translateText(["table", "emptyDataState", "description"])
    }}
    onRowClick={onRowClick}
    infiniteScroll={{
      isEnabled: true,
      height: scrollHeight,
      hasMore: hasNextPage,
      isFetchingNextPage,
      onLoadMore
    }}
    toolbar={toolbar}
    filter={filter}
  />
);

export default CrmTableView;
