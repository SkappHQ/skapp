import { SortConfig } from "@rootcodelabs/skapp-ui";
import { useQueryClient } from "@tanstack/react-query";
import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { ToastType } from "~community/common/enums/ComponentEnums";
import useDebounce from "~community/common/hooks/useDebounce";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import {
  DEAL_PAGE_SIZE,
  DEAL_SEARCH_DEBOUNCE_DELAY
} from "~community/crm/constants/dealConstants";
import { useGetCompaniesByIds } from "~community/crm/v2/api/CompanyApi";
import {
  useGetDealsInfinite,
  useReorderDealInList
} from "~community/crm/v2/api/DealApi";
import { crmDealQueryKeys } from "~community/crm/v2/api/utils/QueryKeys";
import DealsKanbanBoardV2 from "~community/crm/v2/components/organisms/DealsKanbanBoardV2/DealsKanbanBoardV2";
import DealsTableV2 from "~community/crm/v2/components/organisms/DealsTableV2/DealsTableV2";
import { DealViewEnum } from "~community/crm/v2/enums/common";
import useDealListViewConfig from "~community/crm/v2/hooks/useDealListViewConfig";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { CrmSidePanelTypes } from "~community/crm/v2/types/CrmTypes";
import {
  getMissingCompanyIds,
  mergeCompanies
} from "~community/crm/v2/utils/companyUtil";
import {
  fromListTableSortConfig,
  mapConfigSortToQuery,
  toListTableSortConfig
} from "~community/crm/v2/utils/dealListViewUtil";
import {
  mergeDeals,
  reorderDealIds,
  resolveDeals,
  toDealIds
} from "~community/crm/v2/utils/dealUtil";

import DealsHeaderV2 from "./DealsHeaderV2";

const DealsSectionV2: FC = () => {
  const [inputValue, setInputValue] = useState("");
  const [activeView, setActiveView] = useState(DealViewEnum.KANBAN);
  const debouncedSearch = useDebounce(inputValue, DEAL_SEARCH_DEBOUNCE_DELAY);
  const containerRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { mutate: reorderDeal } = useReorderDealInList();
  const translateText = useTranslator("crmModule", "deals", "dealsTable");
  const { setToastMessage } = useToast();

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
    config: columnConfig,
    isConfigLoading,
    handleColumnReorder,
    handleColumnVisibilityChange,
    handleSortChange,
    handleColumnResize
  } = useDealListViewConfig(activeView === DealViewEnum.LIST);

  const { sortKey, sortOrder } = mapConfigSortToQuery(columnConfig?.sort);

  const {
    data,
    isLoading,
    hasNextPage: hasNextPageRaw,
    fetchNextPage,
    isFetchingNextPage
  } = useGetDealsInfinite(
    {
      size: DEAL_PAGE_SIZE,
      sortKey,
      sortOrder,
      searchKeyword: debouncedSearch
    },
    activeView === DealViewEnum.LIST
  );

  const sortConfig = useMemo(
    () => toListTableSortConfig(columnConfig?.sort),
    [columnConfig?.sort]
  );

  const handleSort = useCallback(
    (nextSortConfig: SortConfig[]): void => {
      handleSortChange(
        fromListTableSortConfig(nextSortConfig, columnConfig?.sort ?? null)
      );
    },
    [handleSortChange, columnConfig?.sort]
  );

  const enableRowReorder =
    activeView === DealViewEnum.LIST &&
    !columnConfig?.sort &&
    !debouncedSearch.trim();

  const handleRowReorder = useCallback(
    (movingId: string, previousId?: string, nextId?: string): void => {
      const dealId = Number(movingId);
      const previousDealId = previousId != null ? Number(previousId) : null;
      const nextDealId = nextId != null ? Number(nextId) : null;

      const store = useCrmStoreV2.getState();
      const previousDealIds = store.dealIds;
      store.setDealIds(
        reorderDealIds(store.dealIds, dealId, previousDealId, nextDealId)
      );

      reorderDeal(
        { dealId, previousDealId, nextDealId },
        {
          onError: () => {
            useCrmStoreV2.getState().setDealIds(previousDealIds);
            setToastMessage({
              open: true,
              toastType: ToastType.ERROR,
              title: translateText([
                "inlineEdit",
                "toastMessages",
                "editErrorTitle"
              ]),
              description: translateText([
                "inlineEdit",
                "toastMessages",
                "editErrorDescription"
              ])
            });
            queryClient.invalidateQueries({
              queryKey: crmDealQueryKeys.GET_DEALS_ROOT
            });
          }
        }
      );
    },
    [reorderDeal, setToastMessage, translateText, queryClient]
  );

  const hasNextPage = Boolean(hasNextPageRaw);
  const deals = useMemo(
    () => resolveDeals(dealIds, dealRecord),
    [dealIds, dealRecord]
  );

  useEffect(() => {
    if (!data || activeView !== DealViewEnum.LIST) return;
    const store = useCrmStoreV2.getState();
    const items = data.pages.flatMap((page) => page.items);
    store.setDeals(mergeDeals(store.deals, items));
    store.setDealIds(toDealIds(items));
  }, [data, activeView]);

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
      store.setCompanies(mergeCompanies(store.companies, fetchedCompanies));
    }
  }, [fetchedCompanies]);

  const loadMore = useCallback(async (): Promise<void> => {
    if (hasNextPage && !isFetchingNextPage) {
      await fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleDealClick = useCallback(
    (dealId: number): void => {
      setSelectedDealId(dealId);
      openCrmSidePanel(CrmSidePanelTypes.DEAL_DETAIL_SIDE_PANEL);
    },
    [setSelectedDealId, openCrmSidePanel]
  );

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
            isConfigLoading={isConfigLoading}
            deals={deals}
            hasNextPage={hasNextPage}
            onLoadMore={loadMore}
            onDealClick={handleDealClick}
            columnConfig={columnConfig}
            sortConfig={sortConfig}
            onColumnReorder={handleColumnReorder}
            onColumnVisibilityChange={handleColumnVisibilityChange}
            onColumnResize={handleColumnResize}
            onSort={handleSort}
            enableRowReorder={enableRowReorder}
            onRowReorder={handleRowReorder}
          />
        ) : (
          <DealsKanbanBoardV2 searchKeyword={debouncedSearch} />
        )}
      </div>
    </div>
  );
};

export default DealsSectionV2;
