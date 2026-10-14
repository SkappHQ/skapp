import { SortConfig } from "@rootcodelabs/skapp-ui";
import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { ToastType } from "~community/common/enums/ComponentEnums";
import useDebounce from "~community/common/hooks/useDebounce";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useGetCompaniesByIds } from "~community/crm/api/CompanyApi";
import {
  useGetDealsInfinite,
  useReorderDealInList
} from "~community/crm/api/DealApi";
import DealsKanbanBoard from "~community/crm/components/organisms/DealsKanbanBoard/DealsKanbanBoard";
import DealsTable from "~community/crm/components/organisms/DealsTable/DealsTable";
import { DEAL_PAGE_SIZE } from "~community/crm/constants/commonConstants";
import { DEAL_SEARCH_DEBOUNCE_DELAY } from "~community/crm/constants/dealConstants";
import { DealViewEnum } from "~community/crm/enums/common";
import { useDealListViewConfig } from "~community/crm/hooks/useDealListViewConfig";
import { useCrmStore } from "~community/crm/store/store";
import { CrmSidePanelTypes } from "~community/crm/types/CrmTypes";
import {
  getMissingCompanyIds,
  updateCompanyRecord
} from "~community/crm/utils/companyUtil";
import { resolveSortChange } from "~community/crm/utils/dealListViewUtil";
import {
  mergeDeals,
  reorderDealIds,
  resolveDeals,
  stripDealIdPrefix,
  toDealIds
} from "~community/crm/utils/dealUtil";

import DealsHeader from "./DealsHeader";

const DealsSection: FC = () => {
  const [inputValue, setInputValue] = useState("");
  const [activeView, setActiveView] = useState(DealViewEnum.KANBAN);
  const debouncedSearch = useDebounce(
    stripDealIdPrefix(inputValue),
    DEAL_SEARCH_DEBOUNCE_DELAY
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const handleReorderError = (): void => {
    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateText([
        "deals",
        "table",
        "inlineEdit",
        "toastMessages",
        "editErrorTitle"
      ]),
      description: translateText([
        "deals",
        "table",
        "inlineEdit",
        "toastMessages",
        "editErrorDescription"
      ])
    });
  };

  const { mutate: reorderDeal } = useReorderDealInList(handleReorderError);
  const translateText = useTranslator("crmModule");
  const { setToastMessage } = useToast();

  const {
    companies,
    dealIds,
    dealRecord,
    setDeals,
    setCompanies,
    setDealIds,
    setSelectedDealId,
    openCrmSidePanel
  } = useCrmStore(
    useShallow((state) => ({
      companies: state.companies,
      dealIds: state.dealIds,
      dealRecord: state.deals,
      setDeals: state.setDeals,
      setCompanies: state.setCompanies,
      setDealIds: state.setDealIds,
      setSelectedDealId: state.setSelectedDealId,
      openCrmSidePanel: state.openCrmSidePanel
    }))
  );

  const {
    columnConfig,
    isConfigLoading,
    handleColumnReorder,
    handleColumnVisibilityChange,
    handleSortChange,
    handleColumnResize
  } = useDealListViewConfig(activeView === DealViewEnum.LIST);

  const {
    data,
    isLoading,
    hasNextPage: hasNextPageRaw,
    fetchNextPage,
    isFetchingNextPage
  } = useGetDealsInfinite(
    {
      size: DEAL_PAGE_SIZE,
      sortKey: columnConfig?.sort?.field,
      sortOrder: columnConfig?.sort?.direction,
      searchKeyword: debouncedSearch
    },
    activeView === DealViewEnum.LIST && !!columnConfig
  );

  const sortConfig = useMemo(
    () =>
      columnConfig?.sort
        ? [
            {
              columnId: columnConfig.sort.field,
              direction: columnConfig.sort.direction
            }
          ]
        : [],
    [columnConfig?.sort]
  );

  const handleSort = useCallback(
    (nextSortConfig: SortConfig[]): void => {
      handleSortChange(
        resolveSortChange(nextSortConfig, columnConfig?.sort ?? null)
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

      const previousDealIds = dealIds;
      setDealIds(reorderDealIds(dealIds, dealId, previousDealId, nextDealId));

      reorderDeal(
        { dealId, previousDealId, nextDealId },
        { onError: () => setDealIds(previousDealIds) }
      );
    },
    [reorderDeal, translateText, dealIds]
  );

  const hasNextPage = Boolean(hasNextPageRaw);
  const deals = useMemo(
    () => resolveDeals(dealIds, dealRecord),
    [dealIds, dealRecord]
  );

  useEffect(() => {
    if (!data || activeView !== DealViewEnum.LIST) return;
    const items = data.pages.flatMap((page) => page.items);
    setDeals(mergeDeals(dealRecord, items));
    setDealIds(toDealIds(items));
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
      setCompanies(updateCompanyRecord(companies, fetchedCompanies));
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
      <DealsHeader
        inputValue={inputValue}
        onSearchChange={setInputValue}
        activeView={activeView}
        onViewChange={setActiveView}
      />
      <div ref={containerRef} className="flex flex-col w-full gap-4">
        {activeView === DealViewEnum.LIST ? (
          <DealsTable
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
          <DealsKanbanBoard searchKeyword={debouncedSearch} />
        )}
      </div>
    </div>
  );
};

export default DealsSection;
