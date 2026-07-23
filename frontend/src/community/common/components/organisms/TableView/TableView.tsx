import { Popper, TableToolBar, TableV2 } from "@rootcodelabs/skapp-ui";
import { FC, MouseEvent, useState } from "react";

import useAutoFocusMenuListener from "~community/common/utils/hooks/useAutoFocusMenuListeners";

import { TableViewProps } from "./types";

const TableView: FC<TableViewProps> = ({
  tableName,
  regionAriaLabel,
  ariaLabel,
  headers,
  rows,
  isLoading,
  skeletonRows,
  loader,
  emptyState,
  onRowClick,
  className,
  height,
  pagination,
  infiniteScroll,
  toolbar,
  filter
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);
  const isFilterEnabled = Boolean(filter?.isEnabled);
  const { isEnabled: toolbarEnabled, ...toolbarProps } = toolbar ?? {};
  const isToolbarVisible = Boolean(toolbarEnabled) || isFilterEnabled;
  const isInfiniteScroll = Boolean(infiniteScroll?.isEnabled);
  const isPaginated = !isInfiniteScroll && Boolean(pagination?.isEnabled);
  const popoverId = filter?.popoverId ?? "table-view-filter-popper";

  const closePopover = () => setAnchorEl(null);

  useAutoFocusMenuListener(anchorEl, popoverId, closePopover);

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
    <div className={`flex w-full flex-col gap-3 ${className ?? ""}`.trim()}>
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
        emptyState={emptyState as any}
        onRowClick={onRowClick}
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
          handleClose={closePopover}
          position="bottom-end"
          id={popoverId}
          ariaRole="dialog"
          ariaLabel={filter?.popoverAriaLabel}
          ariaLabelledBy={filter?.popoverAriaLabelledBy}
        >
          {filter?.filterContent({ close: closePopover })}
        </Popper>
      )}
    </div>
  );
};

export default TableView;
