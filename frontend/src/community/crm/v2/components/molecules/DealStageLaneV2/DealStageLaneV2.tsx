import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { ButtonV2, PlusIcon } from "@rootcodelabs/skapp-ui";
import { FC, useCallback, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useInfiniteScroll } from "~community/common/hooks/useInfiniteScroll";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import DealCardSkeleton from "~community/crm/components/molecules/DealCardSkeleton/DealCardSkeleton";
import { DEFAULT_BOARD_PAGE_SIZE } from "~community/crm/constants/boardConstants";
import useStageNameMapper from "~community/crm/hooks/useStageNameMapper";
import { useFetchMoreStageDeals } from "~community/crm/v2/api/BoardApi";
import DraggableDealCardV2 from "~community/crm/v2/components/molecules/DraggableDealCardV2/DraggableDealCardV2";
import { STAGE_COLOR_MAP } from "~community/crm/v2/constants/stageConstants";
import { CrmKanbanDragType } from "~community/crm/v2/enums/common";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { CrmKanbanDragData } from "~community/crm/v2/types/CrmTypes";
import { ingestBoardStageDeals } from "~community/crm/v2/utils/boardUtil";
import { formatCurrency } from "~community/crm/v2/utils/commonUtil";
import { resolveColumnDeals } from "~community/crm/v2/utils/selectorUtils";

interface DealStageLaneV2Props {
  stageId: number;
  isLoading: boolean;
  isOver?: boolean;
  searchKeyword?: string;
  onDealClick: (dealId: number) => void;
  onAddDeal: (stageId: number) => void;
  isAddDealDisabled?: boolean;
}

const DealStageLaneV2: FC<DealStageLaneV2Props> = ({
  stageId,
  isLoading,
  isOver = false,
  searchKeyword,
  onDealClick,
  onAddDeal,
  isAddDealDisabled = false
}) => {
  const translateText = useTranslator("crmModule", "deals", "kanban");
  const { setToastMessage } = useToast();

  const handleLoadMoreError = (): void => {
    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateText(["toastMessages", "loadMoreErrorTitle"]),
      description: translateText(["toastMessages", "loadMoreErrorDescription"])
    });
  };

  const {
    stage,
    column,
    dealRecord,
    board,
    dealIds: boardDealIds,
    setDeals,
    setBoardColumn,
    setDealIds
  } = useCrmStoreV2(
    useShallow((store) => ({
      stage: store.stages[stageId],
      column: store.board[stageId],
      dealRecord: store.deals,
      board: store.board,
      dealIds: store.dealIds,
      setDeals: store.setDeals,
      setBoardColumn: store.setBoardColumn,
      setDealIds: store.setDealIds
    }))
  );

  const deals = useMemo(
    () => resolveColumnDeals(column, dealRecord),
    [column, dealRecord]
  );

  const { getStageByName } = useStageNameMapper();
  const stageName = getStageByName(stage?.name ?? "");

  const dropData: CrmKanbanDragData = {
    type: CrmKanbanDragType.STAGE,
    stageId
  };
  const { setNodeRef } = useDroppable({
    id: `stage-${stageId}`,
    data: dropData
  });

  const totalValue = useMemo(
    () => deals.reduce((sum, deal) => sum + (Number(deal.amount) || 0), 0),
    [deals]
  );
  const dealIds = useMemo(
    () => deals.map((deal) => deal.id).filter((id): id is number => id != null),
    [deals]
  );

  const currentPage = column?.currentPage ?? 0;
  const hasNextPage = column?.hasNextPage ?? false;
  const totalCount = column?.totalCount ?? 0;

  const { mutate: fetchMoreStageDeals, isPending: isLoadingMore } =
    useFetchMoreStageDeals((groups) => {
      const next = ingestBoardStageDeals(
        { deals: dealRecord, board, dealIds: boardDealIds },
        groups,
        { append: true }
      );
      setDeals(next.deals);
      setBoardColumn(next.board);
      setDealIds(next.dealIds);
    }, handleLoadMoreError);

  const loadMore = useCallback((): void => {
    fetchMoreStageDeals({
      stageIds: [stageId],
      searchKeyword,
      page: currentPage + 1,
      limit: DEFAULT_BOARD_PAGE_SIZE
    });
  }, [stageId, currentPage, searchKeyword, fetchMoreStageDeals]);

  const { loadingRef } = useInfiniteScroll({
    hasNextPage,
    isLoading: isLoadingMore,
    onLoadMore: loadMore
  });

  const stageColor = stage?.color ? STAGE_COLOR_MAP[stage.color] : undefined;

  return (
    <section
      ref={setNodeRef}
      className={`flex h-full w-75 shrink-0 flex-col rounded-lg bg-tertiary-background outline-1 transition-shadow ${
        isOver
          ? "outline-primary-accent ring-2 ring-primary-background"
          : "outline-secondary-accent"
      }`}
      aria-labelledby={`crm-stage-${stageId}`}
    >
      <div
        className="h-1.75 rounded-lg m-2"
        style={{ backgroundColor: stageColor }}
      />

      <div className="flex items-center justify-between gap-2 px-3 pt-3">
        <div className="min-w-0">
          <h2
            id={`crm-stage-${stageId}`}
            className="subtitle1 truncate capitalize"
            title={stageName}
          >
            {stageName}
          </h2>
          <p
            className={`body3 mt-0.5 text-secondary-icon ${
              totalValue > 0 ? "" : "invisible"
            }`}
          >
            {formatCurrency(totalValue)}
          </p>
        </div>
        <span className="flex h-8 min-w-8 shrink-0 items-center justify-center rounded-full body3 bg-white px-1.5 text-secondary-text">
          {totalCount}
        </span>
      </div>

      <div className="mt-3 flex min-h-0 flex-1 flex-col gap-3 h-full overflow-y-auto overflow-x-hidden px-3 pb-3">
        {isLoading ? (
          <DealCardSkeleton count={3} />
        ) : (
          <>
            <SortableContext
              items={dealIds}
              strategy={verticalListSortingStrategy}
            >
              {dealIds.map((dealId) => (
                <DraggableDealCardV2
                  key={dealId}
                  dealId={dealId}
                  onDealClick={onDealClick}
                />
              ))}
            </SortableContext>

            {hasNextPage && isLoadingMore && (
              <>
                <DealCardSkeleton count={2} />
                <div className="h-1 w-full" />
              </>
            )}

            <ButtonV2
              variant="line"
              type="button"
              isFullWidth
              size="sm"
              icon={<PlusIcon />}
              iconPosition="end"
              onClick={() => onAddDeal(stageId)}
              disabled={isAddDealDisabled}
              isLoading={isAddDealDisabled}
            >
              {translateText(["addDealBtn"])}
            </ButtonV2>
          </>
        )}
        <div ref={loadingRef} />
      </div>
    </section>
  );
};

export default DealStageLaneV2;
