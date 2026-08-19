import { FC, useEffect, useMemo, useRef, useState } from "react";

import useDebounce from "~community/common/hooks/useDebounce";
import { SortOrderTypes } from "~community/common/types/CommonTypes";
import {
  DEAL_PAGE_SIZE,
  DEAL_SEARCH_DEBOUNCE_DELAY
} from "~community/crm/constants/dealConstants";
import DealsKanbanBoardV2 from "~community/crm/v2/components/organisms/DealsKanbanBoardV2/DealsKanbanBoardV2";
import DealsTableV2 from "~community/crm/v2/components/organisms/DealsTableV2/DealsTableV2";
import { CrmDealSortEnum, DealViewEnum } from "~community/crm/v2/enums/common";
import { useDealsListV2 } from "~community/crm/v2/hooks/useDealsListV2";
import { useHydrateCompanies } from "~community/crm/v2/hooks/useHydrateCompanies";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { CrmSidePanelTypes } from "~community/crm/v2/types/CrmTypes";

import DealsHeaderV2 from "./DealsHeaderV2";

const DealsSectionV2: FC = () => {
  const [inputValue, setInputValue] = useState("");
  const [activeView, setActiveView] = useState(DealViewEnum.KANBAN);
  const debouncedSearch = useDebounce(inputValue, DEAL_SEARCH_DEBOUNCE_DELAY);
  const containerRef = useRef<HTMLDivElement>(null);

  const { setSelectedDealId, openCrmSidePanel } = useCrmStoreV2((store) => ({
    setSelectedDealId: store.setSelectedDealId,
    openCrmSidePanel: store.openCrmSidePanel
  }));

  const { deals, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useDealsListV2(
      {
        size: DEAL_PAGE_SIZE,
        sortKey: CrmDealSortEnum.STAGE_ORDER,
        sortOrder: SortOrderTypes.ASC,
        searchKeyword: debouncedSearch
      },
      activeView === DealViewEnum.LIST
    );

  // Hydrate the `companies` record for every loaded deal — list and board, first
  // page and load-more — off the `deals` the store keeps in `dealIds` order. The
  // scalar deal payload carries only `companyId`, so board/table cards resolve
  // `companies[deal.companyId]` against what this fills.
  const companyIds = useMemo(
    () =>
      deals
        .map((deal) => deal.companyId)
        .filter((id): id is number => id != null),
    [deals]
  );
  useHydrateCompanies(companyIds);

  const loadMore = async (): Promise<void> => {
    if (hasNextPage && !isFetchingNextPage) {
      await fetchNextPage();
    }
  };

  const handleDealClick = (dealId: number): void => {
    setSelectedDealId(dealId);
    openCrmSidePanel(CrmSidePanelTypes.DEAL_DETAIL_SIDE_PANEL);
  };

  // Match the v1 section's dynamic height so the table/board fill the viewport.
  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        const offsetTop = containerRef.current.getBoundingClientRect().top;
        containerRef.current.style.height = `calc(96vh - ${offsetTop}px)`;
      }
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);
    const observer = new ResizeObserver(updateHeight);
    if (containerRef.current?.parentElement) {
      observer.observe(containerRef.current.parentElement);
    }

    return () => {
      window.removeEventListener("resize", updateHeight);
      observer.disconnect();
    };
  }, [activeView]);

  return (
    <div className="flex flex-col gap-6 w-full">
      <DealsHeaderV2
        inputValue={inputValue}
        onSearchChange={setInputValue}
        activeView={activeView}
        onViewChange={setActiveView}
      />
      <div ref={containerRef} className="flex flex-col w-full gap-4">
        {activeView === DealViewEnum.LIST ? (
          <DealsTableV2
            searchKeyword={debouncedSearch}
            isLoading={isLoading}
            deals={deals}
            hasNextPage={hasNextPage}
            onLoadMore={loadMore}
            onDealClick={handleDealClick}
          />
        ) : (
          <DealsKanbanBoardV2 searchKeyword={debouncedSearch} />
        )}
      </div>
    </div>
  );
};

export default DealsSectionV2;
