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

export interface TableViewFilter {
  filterCount: number;
  filterContent: (args: { close: () => void }) => ReactNode;
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

export interface TableViewProps {
  // ---- heading rendered above the toolbar/table ----
  heading?: ReactNode;

  // ---- TableV2 passthrough ----
  tableName?: string;
  regionAriaLabel?: string;
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

  // ---- mode: at most one of these ----
  pagination?: TableViewPagination;
  infiniteScroll?: TableViewInfiniteScroll;

  // ---- toolbar (skapp-ui TableToolBar); filterButton is managed internally ----
  toolbar?: Omit<TableToolBarProps, "filterButton"> & { isEnabled?: boolean };

  // ---- filter popover wired into the toolbar filter button ----
  filter?: TableViewFilter;

  // ---- footer region below the table (view-full-list button, notes, …) ----
  footer?: { left?: ReactNode; right?: ReactNode };
}
