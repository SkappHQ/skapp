import { FC, useMemo, useState } from "react";

import useDebounce from "~community/common/hooks/useDebounce";
import { SortOrderTypes } from "~community/common/types/CommonTypes";
import { useGetDealsInfinite } from "~community/crm/api/crmDealApi";
import DealsKanbanBoard from "~community/crm/components/organisms/DealsKanbanBoard/DealsKanbanBoard";
import DealsTable from "~community/crm/components/organisms/DealsTable/DealsTable";
import {
  DEAL_PAGE_SIZE,
  DEAL_SEARCH_DEBOUNCE_DELAY
} from "~community/crm/constants/dealConstants";
import { CrmDealSortEnum, DealSidePanelTypes, DealViewEnum } from "~community/crm/enums/common";
import { useCrmStore } from "~community/crm/store/store";
import { CrmDealListItem } from "~community/crm/types/CommonTypes";

import DealsHeader from "./DealsHeader/DealsHeader";

const DealsSection: FC = () => {
  const [inputValue, setInputValue] = useState("");
  const [activeView, setActiveView] = useState(DealViewEnum.LIST);
  const debouncedSearch = useDebounce(inputValue, DEAL_SEARCH_DEBOUNCE_DELAY);

  const { setSelectedDealId, setIsCrmSidePanelOpen, setActiveDealSidePanel } =
    useCrmStore((store) => ({
      setSelectedDealId: store.setSelectedDealId,
      setIsCrmSidePanelOpen: store.setIsCrmSidePanelOpen,
      setActiveDealSidePanel: store.setActiveDealSidePanel
    }));

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

  return (
    <div className="flex flex-col gap-6 w-full">
      <DealsHeader
        inputValue={inputValue}
        onSearchChange={setInputValue}
        activeView={activeView}
        onViewChange={setActiveView}
      />
      {activeView === DealViewEnum.LIST ? (
        <DealsTable
          searchKeyword={debouncedSearch}
          isLoading={isLoading}
          allDeals={allDeals ?? []}
          hasNextPage={hasNextPage}
          onLoadMore={loadMore}
          onDealClick={(deal: CrmDealListItem) => {
            setSelectedDealId(deal.id);
            setActiveDealSidePanel(DealSidePanelTypes.DEAL_DETAIL);
            setIsCrmSidePanelOpen(true);
          }}
        />
      ) : (
        <DealsKanbanBoard searchKeyword={debouncedSearch} />
      )}
    </div>
  );
};

export default DealsSection;
