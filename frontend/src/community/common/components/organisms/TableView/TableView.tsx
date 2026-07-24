import {
  Popper,
  type PopperProps,
  TableToolBar,
  TableV2
} from "@rootcodelabs/skapp-ui";
import { FC, MouseEvent, useState } from "react";

import useAutoFocusMenuListener from "~community/common/utils/hooks/useAutoFocusMenuListeners";

import { TableViewProps } from "./types";

const TableView: FC<TableViewProps> = ({
  heading,
  tableName,
  regionAriaLabel,
  ariaLabel,
  headers,
  rows,
  isLoading,
  skeletonRows = 4,
  loader,
  emptyState,
  onRowClick,
  className,
  height,
  minHeight = "min-h-70",
  pagination,
  infiniteScroll,
  toolbar,
  filter
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);
  const isFilterEnabled = filter;
  const { isEnabled: toolbarEnabled, ...toolbarProps } = toolbar ?? {};
  const isToolbarVisible = toolbarEnabled || isFilterEnabled;
  const isInfiniteScroll = infiniteScroll?.isEnabled;
  const isPaginated = !isInfiniteScroll && pagination;
  const popoverId = filter?.popoverId;

  const closePopover = () => setAnchorEl(null);

  const popperProps: Omit<
    PopperProps,
    "open" | "anchorEl" | "position" | "id"
  > = {
    handleClose: closePopover,
    ariaRole: "dialog",
    ariaLabel: filter?.popoverAriaLabel,
    ariaLabelledBy: filter?.popoverAriaLabelledBy
  };

  const togglePopover = (event: MouseEvent<HTMLElement>) =>
    setAnchorEl(anchorEl ? null : event.currentTarget);

  // Merge ariaLabel with backwards-compatible regionAriaLabel fallback
  const mergedAriaLabel = {
    regionAriaLabel: ariaLabel?.regionAriaLabel ?? regionAriaLabel,
    paginationAriaLabel: ariaLabel?.paginationAriaLabel,
    previousPageLabel: ariaLabel?.previousPageLabel,
    nextPageLabel: ariaLabel?.nextPageLabel,
    getPageAriaLabel: ariaLabel?.getPageAriaLabel
  };

  return (
    <div className={`flex w-full flex-col gap-3 ${className ?? ""}`}>
      {heading && <h2 className="h2 my-4">{heading}</h2>}

      {isToolbarVisible && (
        <TableToolBar
          {...toolbarProps}
          filterButton={
            isFilterEnabled
              ? {
                  onClick: togglePopover,
                  "aria-label": filter?.filterButtonAriaLabel,
                  "aria-expanded": open,
                  "aria-haspopup": "dialog",
                  badge: {
                    count: filter?.filterCount ?? 0,
                    show: (filter?.filterCount ?? 0) > 0
                  }
                }
              : undefined
          }
        />
      )}

      <TableV2
        tableName={tableName}
        ariaLabel={mergedAriaLabel}
        headers={headers}
        rows={rows}
        isLoading={isLoading}
        skeletonRows={skeletonRows}
        loader={loader}
        emptyState={emptyState}
        onRowClick={onRowClick}
        className={minHeight}
        height={isInfiniteScroll ? infiniteScroll?.height : height}
        hasMore={isInfiniteScroll ? infiniteScroll?.hasMore : undefined}
        isFetchingNextPage={
          isInfiniteScroll ? infiniteScroll?.isFetchingNextPage : undefined
        }
        onLoadMore={isInfiniteScroll ? infiniteScroll?.onLoadMore : undefined}
        scrollThreshold={
          isInfiniteScroll ? infiniteScroll?.scrollThreshold : undefined
        }
        totalPages={isPaginated ? pagination?.totalPages : undefined}
        currentPage={isPaginated ? pagination?.currentPage : undefined}
        onPageChange={isPaginated ? pagination?.onPageChange : undefined}
      />

      {isFilterEnabled && (
        <Popper
          open={open}
          anchorEl={anchorEl}
          position="bottom-end"
          id={popoverId}
          containerClassName="rounded-4 shadow-lg"
          {...popperProps}
        >
          {filter?.filterContent({ close: closePopover })}
        </Popper>
      )}
    </div>
  );
};

export default TableView;
