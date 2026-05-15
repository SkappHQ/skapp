import {
  BaseRowData,
  Column,
  GroupData,
  ListTable
} from "@rootcodelabs/skapp-ui";
import {
  FC,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

import AvatarChip from "~community/common/components/molecules/AvatarChip/AvatarChip";
import SearchBox from "~community/common/components/molecules/SearchBox/SearchBox";
import { useTranslator } from "~community/common/hooks/useTranslator";
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

  // Triggered by skapp-ui Table's built-in scroll detection
  const handleLoadMore = useCallback(async () => {
    if (!hasMore || isFetching || isFetchingMoreRef.current) return;
    isFetchingMoreRef.current = true;
    setFetchPage((p) => p + 1);
  }, [hasMore, isFetching]);

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

  const noSearchResultsTitle = useMemo(() => {
    const base = translateText(["noSearchResultsTitle"]);
    return searchKeyword
      ? base.replace("{{searchKeyword}}", `'${searchKeyword}'`)
      : base;
  }, [translateText, searchKeyword]);

  // -------------------------------------------------------------------------
  // Table columns & rows
  // -------------------------------------------------------------------------

  interface DealRow extends BaseRowData {
    id: string;
    dealName: ReactNode;
    value: ReactNode;
    stage: ReactNode;
    companyName: ReactNode;
    contactName: ReactNode;
    dealOwner: ReactNode;
  }

  const columnHeaders = useMemo((): Column<DealRow>[] => [
    {
      id: "dealName",
      title: translateText(["dealColumn"]),
      field: "dealName",
      width: 200,
      minWidth: 120,
      resizable: true,
      draggable: true,
      visible: true,
      sortable: false
    },
    {
      id: "value",
      title: translateText(["valueColumn"]),
      field: "value",
      width: 150,
      minWidth: 100,
      resizable: true,
      draggable: true,
      visible: true,
      sortable: false
    },
    {
      id: "stage",
      title: translateText(["stageColumn"]),
      field: "stage",
      width: 150,
      minWidth: 100,
      resizable: true,
      draggable: true,
      visible: true,
      sortable: false
    },
    {
      id: "companyName",
      title: translateText(["companyNameColumn"]),
      field: "companyName",
      width: 180,
      minWidth: 120,
      resizable: true,
      draggable: true,
      visible: true,
      sortable: false
    },
    {
      id: "contactName",
      title: translateText(["contactNameColumn"]),
      field: "contactName",
      width: 180,
      minWidth: 120,
      resizable: true,
      draggable: true,
      visible: true,
      sortable: false
    },
    {
      id: "dealOwner",
      title: translateText(["dealOwnerColumn"]),
      field: "dealOwner",
      width: 180,
      minWidth: 120,
      resizable: true,
      draggable: true,
      visible: true,
      sortable: false
    }
  ], [translateText]);

  const tableRows = useMemo((): DealRow[] => {
    return allDeals.map((deal: CrmDealListItemType) => {
      const stageColor =
        deal.stageColor ?? stageColorMap[deal.stageId] ?? "#6B7280";
      const [ownerFirst = "", ...rest] = (deal.ownerName ?? "").split(" ");
      const ownerLast = rest.join(" ");
      return {
        id: String(deal.id),
        dealName: deal.name ?? "",
        value: deal.amount
          ? `$${Number(deal.amount).toLocaleString()}`
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
            firstName={ownerFirst}
            lastName={ownerLast}
            avatarUrl={undefined}
            chipStyles={{ maxWidth: "fit-content" }}
          />
        )
      };
    });
  }, [allDeals, stageColorMap]);

  const tableData = useMemo((): GroupData<DealRow>[] => [
    { items: tableRows }
  ], [tableRows]);

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div className="flex flex-col gap-3">
      <div className="w-60">
        <SearchBox
          placeHolder={translateText(["searchPlaceholder"])}
          value={searchKeyword}
          setSearchTerm={handleSearchChange}
          name="dealSearch"
        />
      </div>
      <ListTable<DealRow>
        columnHeaders={columnHeaders}
        data={tableData}
        hasMore={hasMore}
        onLoadMore={handleLoadMore}
        emptyStateTitle={
          searchKeyword
            ? noSearchResultsTitle
            : translateText(["noDealsTitle"])
        }
        emptyStateDescription={
          searchKeyword
            ? translateText(["noSearchResultsDescription"])
            : translateText(["noDealsDescription"])
        }
        infiniteScrollLoadingMessage="Loading more deals..."
        scrollThreshold={0.8}
      />
    </div>
  );
};

export default DealTable;

