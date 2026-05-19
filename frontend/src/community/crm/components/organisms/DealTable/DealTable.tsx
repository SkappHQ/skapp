import {
  AvatarChip,
  BaseRowData,
  Column,
  GroupData,
  InputField,
  ListTable,
  ProjectTableSkeletonLoader,
  SearchIcon
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

import { useTranslator } from "~community/common/hooks/useTranslator";
import {
  useGetDeals,
  useGetDealStages
} from "~community/crm/api/crmDealApi";
import { CrmDealSortEnum, CrmDealStageEnum } from "~community/crm/enums/common";
import { SortOrderTypes } from "~community/common/types/CommonTypes";
import { CrmDealListItemType } from "~community/crm/types/CommonTypes";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PAGE_SIZE = 15;

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

  // Side-panel actions are driven via deals.tsx (openCreatePanel on the header button);
  // DealTable only needs to know if the panel is open to avoid row-click conflicts in future.
  // No store subscriptions needed here for now.

  const [fetchPage, setFetchPage] = useState(0);
  const [allDeals, setAllDeals] = useState<CrmDealListItemType[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isFetchingMoreRef = useRef(false);

  // Cleanup debounce on unmount to avoid setState on unmounted component
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const { data: dealsData, isFetching } = useGetDeals({
    page: fetchPage,
    size: PAGE_SIZE,
    sortKey: CrmDealSortEnum.STAGE_TYPE,
    sortOrder: SortOrderTypes.ASC,
    searchKeyword: searchKeyword || undefined
  });

  // Accumulate pages as data arrives; dedupe by id to prevent duplicates on refetch
  useEffect(() => {
    isFetchingMoreRef.current = false;
    if (!dealsData?.items) return;
    if (dealsData.currentPage === 0) {
      setAllDeals(dealsData.items);
    } else {
      setAllDeals((prev) => {
        const existingIds = new Set(prev.map((d) => d.id));
        const newItems = dealsData.items.filter((d) => !existingIds.has(d.id));
        return [...prev, ...newItems];
      });
    }
    setHasMore(dealsData.currentPage < (dealsData.totalPages ?? 1) - 1);
  }, [dealsData]);

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

  // Reset accumulated data when filters change; also clear allDeals so the
  // stale previous results are not shown while the new page-0 response loads
  const resetPagination = useCallback(() => {
    setAllDeals([]);
    setFetchPage(0);
    setHasMore(true);
    isFetchingMoreRef.current = false;
  }, []);

  // Handlers
  const handleSearchChange = (value: string) => {
    setInputValue(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearchKeyword(value);
      resetPagination();
    }, 300);
  };

  const noSearchResultsTitle = useMemo(
    () =>
      searchKeyword
        ? translateText(["noSearchResultsTitle"], { searchKeyword: `'${searchKeyword}'` })
        : translateText(["noSearchResultsTitle"]),
    [translateText, searchKeyword]
  );

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
      width: 300,
      minWidth: 160,
      resizable: false,
      draggable: false,
      visible: true,
      sortable: false
    },
    {
      id: "value",
      title: translateText(["valueColumn"]),
      field: "value",
      width: 160,
      minWidth: 90,
      resizable: false,
      draggable: false,
      visible: true,
      sortable: false
    },
    {
      id: "stage",
      title: translateText(["stageColumn"]),
      field: "stage",
      width: 160,
      minWidth: 100,
      resizable: false,
      draggable: false,
      visible: true,
      sortable: false
    },
    {
      id: "companyName",
      title: translateText(["companyNameColumn"]),
      field: "companyName",
      width: 200,
      minWidth: 120,
      resizable: false,
      draggable: false,
      visible: true,
      sortable: false
    },
    {
      id: "contactName",
      title: translateText(["contactNameColumn"]),
      field: "contactName",
      width: 200,
      minWidth: 120,
      resizable: false,
      draggable: false,
      visible: true,
      sortable: false
    },
    {
      id: "dealOwner",
      title: translateText(["dealOwnerColumn"]),
      field: "dealOwner",
      width: 200,
      minWidth: 120,
      resizable: false,
      draggable: false,
      visible: true,
      sortable: false
    }
  ], [translateText]);

  const tableRows = useMemo((): DealRow[] => {
    return allDeals.map((deal: CrmDealListItemType) => {
      const stageColor =
        deal.stageColor ?? stageColorMap[deal.stageId] ?? "#6B7280";
      const [ownerFirst = "", ...rest] = deal.ownerName.split(" ");
      const ownerLast = rest.join(" ");
      const parsedAmount = deal.amount !== null ? Number(deal.amount) : NaN;
      return {
        id: String(deal.id),
        dealName: <span className="body2">{deal.name}</span>,
        value: (
          <span className="body2 w-full block text-right">
            {Number.isFinite(parsedAmount) && parsedAmount > 0
              ? `$${parsedAmount.toLocaleString()}`
              : "\u2014"}
          </span>
        ),
        stage: (
          <div className="inline-flex items-center gap-2">
            <div
              className="size-2 rounded-full shrink-0"
              style={{ backgroundColor: stageColor }}
            />
            <span className="body2">{deal.stageName}</span>
          </div>
        ),
        companyName: (
          <span className="body2">{deal.companyName ?? "\u2014"}</span>
        ),
        contactName: (
          <span className="body2">{deal.contactName}</span>
        ),
        dealOwner: (
          <AvatarChip
            avatarProps={{
              id: String(deal.ownerId),
              firstName: ownerFirst,
              lastName: ownerLast,
              src: undefined,
              size: "sm"
            }}
            label={deal.ownerName}
            backgroundColor="bg-secondary-background"
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
    <div className="flex flex-col gap-6 w-full">
      <InputField
        placeholder={translateText(["searchPlaceholder"])}
        value={inputValue}
        onChange={(e) => handleSearchChange(e.target.value)}
        type="search"
        variant="md"
        rightIcon={<SearchIcon />}
        ariaLabelClearButton={translateText(["clearSearchAriaLabel"])}
        customStyles={{
          borderRadius: "rounded-full",
          padding: "px-6",
          background: "bg-[#f4f4f5]",
          border: "border-0"
        }}
        className="max-w-[412px] w-full"
      />
      <div className="w-full h-fit max-h-[600px] flex rounded-lg overflow-auto shadow-[0px_2px_8px_0px_rgba(0,0,0,0.12)] [&_table]:!w-full [&_table]:!min-w-full">
        {isFetching && allDeals.length === 0 ? (
          <table className="w-full">
            <ProjectTableSkeletonLoader rowCount={8} />
          </table>
        ) : (
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
          scrollThreshold={0.8}
          showKebabMenu={false}
          showColumnVisibilityToggle={false}
          disableColumnDragging
          infiniteScrollLoadingMessage={translateText(["infiniteScrollLoadingMessage"])}
        />
        )}
      </div>
    </div>
  );
};

export default DealTable;

