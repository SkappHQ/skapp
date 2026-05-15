import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";

import AvatarChip from "~community/common/components/molecules/AvatarChip/AvatarChip";
import SearchBox from "~community/common/components/molecules/SearchBox/SearchBox";
import Table from "~community/common/components/molecules/Table/Table";
import { TableNames } from "~community/common/enums/Table";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import {
  useGetDeals,
  useGetDealStages
} from "~community/crm/api/crmDealApi";
import { CrmDealSortOrder, CrmDealStageEnum } from "~community/crm/enums/common";
import { CrmDealListItemType } from "~community/crm/types/CommonTypes";
import { useAppStore } from "../../../../../store/store";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PAGE_SIZE = 10;

const STAGE_FALLBACK_COLOR: Record<string, string> = {
  [CrmDealStageEnum.INITIAL]: "#3B82F6",
  [CrmDealStageEnum.OPEN]: "#F59E0B",
  [CrmDealStageEnum.WON]: "#10B981",
  [CrmDealStageEnum.LOST]: "#EF4444"
};

// ---------------------------------------------------------------------------
// DealTable
// ---------------------------------------------------------------------------

const DealTable: FC = () => {
  const translateText = useTranslator("crmModule", "deals", "dealsTable");

  const { openCreatePanel, openSidePanel } = useAppStore((state) => ({
    openCreatePanel: state.openCreatePanel,
    openSidePanel: state.openSidePanel
  }));

  const [fetchPage, setFetchPage] = useState(0);
  const [allDeals, setAllDeals] = useState<CrmDealListItemType[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState("");

  const tableContainerRef = useRef<HTMLDivElement>(null);
  const isFetchingMoreRef = useRef(false);

  const { data: dealsData, isFetching } = useGetDeals(
    fetchPage,
    PAGE_SIZE,
    CrmDealSortOrder.NEWEST,
    "CREATED_DATE",
    searchKeyword || undefined
  );

  // Accumulate pages as data arrives
  useEffect(() => {
    if (!dealsData?.items || isFetching) return;
    if (fetchPage === 0) {
      setAllDeals(dealsData.items);
    } else {
      setAllDeals((prev) => [...prev, ...dealsData.items]);
    }
    setHasMore(fetchPage < (dealsData.totalPages ?? 1) - 1);
    isFetchingMoreRef.current = false;
  }, [dealsData, isFetching, fetchPage]);

  // Scroll-based infinite load
  const handleLoadMore = useCallback(() => {
    if (!hasMore || isFetching || isFetchingMoreRef.current) return;
    isFetchingMoreRef.current = true;
    setFetchPage((p) => p + 1);
  }, [hasMore, isFetching]);

  useEffect(() => {
    const el = tableContainerRef.current;
    if (!el) return;
    const onScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      if (scrollHeight - scrollTop - clientHeight < 150) {
        handleLoadMore();
      }
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, [handleLoadMore]);

  const { data: stages = [] } = useGetDealStages();

  const stageColorMap = useMemo(() => {
    const map: Record<number, string> = {};
    stages.forEach((s) => {
      map[s.id] = s.color || STAGE_FALLBACK_COLOR[s.stageType] || "#6B7280";
    });
    return map;
  }, [stages]);

  // Reset accumulated data when filters change
  const resetPagination = useCallback(() => {
    setFetchPage(0);
    setAllDeals([]);
    setHasMore(true);
    isFetchingMoreRef.current = false;
  }, []);

  // Handlers
  const handleSearchChange = (value: string) => {
    setSearchKeyword(value);
    resetPagination();
  };

  const handleRowClick = (row: { id: number }) => {
    openSidePanel(row.id);
  };

  const isFiltering = !!searchKeyword;

  const noSearchResultsTitle = useMemo(() => {
    const base = translateText(["noSearchResultsTitle"]);
    return searchKeyword
      ? base.replace("{{searchKeyword}}", `'${searchKeyword}'`)
      : base;
  }, [translateText, searchKeyword]);

  // -------------------------------------------------------------------------
  // Table columns & rows
  // -------------------------------------------------------------------------

  const tableHeaders = [
    { id: "dealName", label: translateText(["dealColumn"]) },
    { id: "value", label: translateText(["valueColumn"]) },
    { id: "stage", label: translateText(["stageColumn"]) },
    { id: "companyName", label: translateText(["companyNameColumn"]) },
    { id: "contactName", label: translateText(["contactNameColumn"]) },
    { id: "dealOwner", label: translateText(["dealOwnerColumn"]) }
  ];

  const tableRows = useMemo(() => {
    return allDeals.map((deal: CrmDealListItemType) => {
      const stageColor =
        deal.stageColor ?? stageColorMap[deal.stageId] ?? "#6B7280";
      const [ownerFirstName = "", ...rest] = (deal.ownerName ?? "").split(" ");
      const ownerLastName = rest.join(" ");

      return {
        id: deal.id,
        dealName: deal.name,
        value: deal.amount
          ? `${Number(deal.amount).toLocaleString()}`
          : "\u2014",
        stage: (
          <div className="inline-flex items-center gap-2">
            <div
              className="size-2 rounded-full shrink-0"
              style={{ backgroundColor: stageColor }}
            />
            <span>{deal.stageName}</span>
          </div>
        ),
        companyName: deal.companyName ?? "\u2014",
        contactName: deal.contactName ?? "\u2014",
        dealOwner: (
          <AvatarChip
            firstName={ownerFirstName}
            lastName={ownerLastName}
            avatarUrl={undefined}
            chipStyles={{ maxWidth: "fit-content" }}
          />
        )
      };
    });
  }, [allDeals, stageColorMap]);

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <Table
      tableName={TableNames.CRM_DEALS}
      headers={tableHeaders}
      rows={tableRows}
      isLoading={isFetching && fetchPage === 0}
      tableContainerRef={tableContainerRef}
      customStyles={{
        container: { maxHeight: "calc(100vh - 220px)", overflow: "auto" }
      }}
      actionToolbar={{
        firstRow: {
          leftButton: (
            <SearchBox
              placeHolder={translateText(["searchPlaceholder"])}
              value={searchKeyword}
              setSearchTerm={handleSearchChange}
              name="dealSearch"
            />
          ),
          rightButton: undefined
        }
      }}
      tableBody={{
        onRowClick: handleRowClick,
        emptyState: {
          isSearching: isFiltering,
          noData: {
            title: translateText(["noDealsTitle"]),
            description: translateText(["noDealsDescription"]),
            button: {
              label: translateText(["addDealBtn"]),
              onClick: openCreatePanel,
              startIcon: IconName.ADD_ICON
            }
          },
          noSearchResults: {
            title: noSearchResultsTitle,
            description: translateText(["noSearchResultsDescription"])
          }
        },
        loadingState: {
          skeleton: { rows: PAGE_SIZE }
        }
      }}
      tableFoot={{
        pagination: {
          isEnabled: false
        }
      }}
    />
  );
};

export default DealTable;

