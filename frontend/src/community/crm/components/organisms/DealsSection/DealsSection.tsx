import { FC, useEffect, useMemo, useRef, useState } from "react";

import useDebounce from "~community/common/hooks/useDebounce";
import { SortOrderTypes } from "~community/common/types/CommonTypes";
import { useGetDealsInfinite } from "~community/crm/api/crmDealApi";
import DealsKanbanBoard from "~community/crm/components/organisms/DealsKanbanBoard/DealsKanbanBoard";
import DealsTable from "~community/crm/components/organisms/DealsTable/DealsTable";
import {
  DEAL_PAGE_SIZE,
  DEAL_SEARCH_DEBOUNCE_DELAY
} from "~community/crm/constants/dealConstants";
import { CrmDealSortEnum, DealViewEnum } from "~community/crm/enums/common";
import useDealDetailPanel from "~community/crm/hooks/useDealDetailPanel";
import { CrmDealListItem } from "~community/crm/types/CommonTypes";

import DealsHeader from "./DealsHeader/DealsHeader";

const DealsSection: FC = () => {
  const [inputValue, setInputValue] = useState("");
  const [activeView, setActiveView] = useState(DealViewEnum.KANBAN);
  const debouncedSearch = useDebounce(inputValue, DEAL_SEARCH_DEBOUNCE_DELAY);
  const containerRef = useRef<HTMLDivElement>(null);

  const { openDealDetail } = useDealDetailPanel();

  const { data, fetchNextPage, hasNextPage, isLoading, isFetchingNextPage } =
    useGetDealsInfinite(
      {
        size: DEAL_PAGE_SIZE,
        sortKey: CrmDealSortEnum.STAGE_ORDER,
        sortOrder: SortOrderTypes.ASC,
        searchKeyword: debouncedSearch
      },
      activeView === DealViewEnum.LIST
    );

  const allDeals = useMemo(
    () => data?.pages.flatMap((p) => p?.items ?? []),
    [data]
  );

  const loadMore = async () => {
    if (hasNextPage && !isFetchingNextPage) {
      await fetchNextPage();
    }
  };

  const handleDealOnClick = (deal: CrmDealListItem) => {
    openDealDetail(deal.id);
  };

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
      <DealsHeader
        inputValue={inputValue}
        onSearchChange={setInputValue}
        activeView={activeView}
        onViewChange={setActiveView}
      />
      {activeView === DealViewEnum.LIST ? (
        <div ref={containerRef} className="flex flex-col w-full gap-4">
          <DealsTable
            searchKeyword={debouncedSearch}
            isLoading={isLoading}
            allDeals={allDeals ?? []}
            hasNextPage={hasNextPage}
            onLoadMore={loadMore}
            onDealClick={handleDealOnClick}
          />
        </div>
      ) : (
        <div ref={containerRef} className="flex flex-col w-full gap-4">
          <DealsKanbanBoard searchKeyword={debouncedSearch} />
        </div>
      )}
    </div>
  );
};

export default DealsSection;
