import type {
  GridHeader,
  GridRow,
  TableToolBarProps,
  TableV2Props
} from "@rootcodelabs/skapp-ui";
import type { ReactNode } from "react";

export type { GridHeader, GridRow } from "@rootcodelabs/skapp-ui";

/** Static pagination — 0-based, passed straight through to TableV2. */
export interface TableViewPagination {
  totalPages?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
}

/** Infinite scroll — requires a fixed `height` on the scroll container. */
export interface TableViewInfiniteScroll {
  isEnabled?: boolean;
  height: string;
  hasMore?: boolean;
  isFetchingNextPage?: boolean;
  onLoadMore?: () => void;
  scrollThreshold?: number;
  loadingMessage?: string;
}

export interface TableViewFilterContentArgs {
  close: () => void;
}

export interface TableViewFilter {
  filterCount: number;
  filterContent: (args: TableViewFilterContentArgs) => ReactNode;
  filterButtonAriaLabel?: string;
  popoverAriaLabel?: string;
  popoverAriaLabelledBy?: string;
  popoverId: string;
}

export interface TableViewAriaLabels {
  regionAriaLabel?: string;
  paginationAriaLabel?: string;
  previousPageLabel?: string;
  nextPageLabel?: string;
  getPageAriaLabel?: (page: number) => string;
}

/** Footer region rendered below the table. */
export interface TableViewFooter {
  left?: ReactNode;
  right?: ReactNode;
}

export interface TableViewProps {
  heading?: ReactNode;
  tableName?: string;
  ariaLabel?: TableViewAriaLabels;
  headers: GridHeader[];
  rows: GridRow[];
  isLoading?: boolean;
  skeletonRows?: number;
  loader?: ReactNode;
  emptyState?: TableV2Props["emptyState"];
  onRowClick?: (row: GridRow, id: string | number) => void;
  className?: string;
  height?: string;
  minHeight?: string;
  pagination?: TableViewPagination;
  infiniteScroll?: TableViewInfiniteScroll;
  toolbar?: Omit<TableToolBarProps, "filterButton">;
  filter?: TableViewFilter;
  footer?: TableViewFooter;
}
