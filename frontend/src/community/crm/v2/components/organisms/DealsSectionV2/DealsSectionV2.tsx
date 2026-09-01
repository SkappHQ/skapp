import { FC, useEffect, useMemo, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import useDebounce from "~community/common/hooks/useDebounce";
import { SortOrderTypes } from "~community/common/types/CommonTypes";
import {
  DEAL_PAGE_SIZE,
  DEAL_SEARCH_DEBOUNCE_DELAY
} from "~community/crm/constants/dealConstants";
import { useGetCompaniesByIds } from "~community/crm/v2/api/CompanyApi";
import { useGetDealsInfinite } from "~community/crm/v2/api/DealApi";
import DealsKanbanBoardV2 from "~community/crm/v2/components/organisms/DealsKanbanBoardV2/DealsKanbanBoardV2";
import DealsTableV2 from "~community/crm/v2/components/organisms/DealsTableV2/DealsTableV2";
import { CrmDealSortEnum, DealViewEnum } from "~community/crm/v2/enums/common";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { CrmSidePanelTypes } from "~community/crm/v2/types/CrmTypes";
import {
  getMissingCompanyIds,
  updateCompanyRecord
} from "~community/crm/v2/utils/companyUtil";
import {
  resolveDeals,
  toDealIds,
  updateDealRecord
} from "~community/crm/v2/utils/dealUtil";

import DealsHeaderV2 from "./DealsHeaderV2";

const DealsSectionV2: FC = () => {
  const [inputValue, setInputValue] = useState("");
  const [activeView, setActiveView] = useState(DealViewEnum.KANBAN);
  const debouncedSearch = useDebounce(inputValue, DEAL_SEARCH_DEBOUNCE_DELAY);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    companies,
    dealIds,
    dealRecord,
    setSelectedDealId,
    openCrmSidePanel
  } = useCrmStoreV2(
    useShallow((store) => ({
      companies: store.companies,
      dealIds: store.dealIds,
      dealRecord: store.deals,
      setSelectedDealId: store.setSelectedDealId,
      openCrmSidePanel: store.openCrmSidePanel
    }))
  );

  const {
    data,
    isLoading,
    hasNextPage: hasNextPageRaw,
    fetchNextPage,
    isFetchingNextPage
  } = useGetDealsInfinite(
    {
      size: DEAL_PAGE_SIZE,
      sortKey: CrmDealSortEnum.STAGE_ORDER,
      sortOrder: SortOrderTypes.ASC,
      searchKeyword: debouncedSearch
    },
    activeView === DealViewEnum.LIST
  );

  const hasNextPage = Boolean(hasNextPageRaw);
  const deals = useMemo(
    () => resolveDeals(dealIds, dealRecord),
    [dealIds, dealRecord]
  );

  useEffect(() => {
    if (!data) return;
    const store = useCrmStoreV2.getState();
    const items = data.pages.flatMap((page) => page.items);
    store.setDeals(updateDealRecord(store.deals, items));
    store.setDealIds(toDealIds(items));
  }, [data]);

  const companyIds = useMemo(
    () =>
      deals
        .map((deal) => deal.companyId)
        .filter((id): id is number => id != null),
    [deals]
  );

  const missingCompanyIds = useMemo(
    () => getMissingCompanyIds(companyIds, companies),
    [companyIds, companies]
  );

  const { data: fetchedCompanies } = useGetCompaniesByIds(
    missingCompanyIds,
    missingCompanyIds.length > 0
  );

  useEffect(() => {
    if (fetchedCompanies && fetchedCompanies.length > 0) {
      const store = useCrmStoreV2.getState();
      store.setCompanies(
        updateCompanyRecord(store.companies, fetchedCompanies)
      );
    }
  }, [fetchedCompanies]);

  const loadMore = async (): Promise<void> => {
    if (hasNextPage && !isFetchingNextPage) {
      await fetchNextPage();
    }
  };

  const handleDealClick = (dealId: number): void => {
    setSelectedDealId(dealId);
    openCrmSidePanel(CrmSidePanelTypes.DEAL_DETAIL_SIDE_PANEL);
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
