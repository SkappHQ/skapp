import {
  Popper,
  type PopperProps,
  TableToolBar,
  TableV2
} from "@rootcodelabs/skapp-ui";
import { FC, MouseEvent, useState } from "react";

import { TableViewProps } from "./types";

const EMPTY_STATE_MIN_HEIGHT = "min-h-80";

const TableView: FC<TableViewProps> = ({
  heading,
  tableName,
  ariaLabel,
  variant,
  headers,
  rows,
  isLoading,
  skeletonRows = 4,
  loader,
  emptyState,
  onRowClick,
  className = "",
  height,
  minHeight = "min-h-70",
  pagination,
  infiniteScroll,
  toolbar,
  filter
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const isOpen = anchorEl !== null;
  const isFilterEnabled = filter;
  const filterContent = filter?.filterContent;
  const isFilterInteractive = !!filterContent && !filter?.isDisabled;
  const isToolbarVisible = toolbar !== undefined || isFilterEnabled;
  const isInfiniteScroll = infiniteScroll?.isEnabled;
  const isPaginated = !isInfiniteScroll && pagination;
  const popoverId = filter?.popoverId;
  const isEmptyStateVisible = !isLoading && rows.length === 0;

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

  const togglePopover = (event: MouseEvent<HTMLElement>) => {
    if (!isFilterInteractive) return;
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const mergedAriaLabel = {
    regionAriaLabel: ariaLabel?.regionAriaLabel,
    paginationAriaLabel: ariaLabel?.paginationAriaLabel,
    previousPageLabel: ariaLabel?.previousPageLabel,
    nextPageLabel: ariaLabel?.nextPageLabel,
    getPageAriaLabel: ariaLabel?.getPageAriaLabel,
    pageSizeAriaLabel: ariaLabel?.pageSizeAriaLabel
  };

  return (
    <div className={`flex w-full flex-col gap-3 ${className}`}>
      {heading && <h2 className="h2 mt-4 mb-1">{heading}</h2>}

      {isToolbarVisible && (
        <TableToolBar
          {...toolbar}
          filterButton={
            isFilterEnabled
              ? {
                  onClick: togglePopover,
                  disabled: filter?.isDisabled,
                  "aria-label": filter?.filterButtonAriaLabel,
                  "aria-expanded": isFilterInteractive ? isOpen : undefined,
                  "aria-haspopup": isFilterInteractive ? "dialog" : undefined,
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
        variant={variant}
        headers={headers}
        rows={rows}
        isLoading={isLoading}
        skeletonRows={skeletonRows}
        loader={loader}
        emptyState={emptyState}
        onRowClick={onRowClick}
        className={isEmptyStateVisible ? EMPTY_STATE_MIN_HEIGHT : minHeight}
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
        pageSizeSelector={
          isPaginated ? pagination?.pageSizeSelector : undefined
        }
      />

      {isFilterInteractive && (
        <Popper
          open={isOpen}
          anchorEl={anchorEl}
          position="bottom-end"
          id={popoverId}
          containerClassName="rounded-4 shadow-lg"
          {...popperProps}
        >
          {filterContent({ onClose: closePopover })}
        </Popper>
      )}
    </div>
  );
};

export default TableView;
