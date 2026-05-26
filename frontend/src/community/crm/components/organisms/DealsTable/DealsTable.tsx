import {
  AvatarChip,
  BaseRowData,
  Column,
  GroupData,
  ListTable,
  ProjectTableSkeletonLoader
} from "@rootcodelabs/skapp-ui";
import { FC, ReactNode, useMemo } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { CrmDealListItemType } from "~community/crm/types/CommonTypes";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DealRow extends BaseRowData {
  id: string;
  dealName: ReactNode;
  value: ReactNode;
  stage: ReactNode;
  companyName: ReactNode;
  contactName: ReactNode;
  dealOwner: ReactNode;
}

interface Props {
  searchKeyword: string;
  isLoading: boolean;
  allDeals: CrmDealListItemType[];
  hasNextPage: boolean;
  onLoadMore: () => Promise<void>;
}

// ---------------------------------------------------------------------------
// DealsTable
// ---------------------------------------------------------------------------

const DealsTable: FC<Props> = ({
  searchKeyword,
  isLoading,
  allDeals,
  hasNextPage,
  onLoadMore
}) => {
  const translateText = useTranslator("crmModule", "deals", "dealsTable");

  const noSearchResultsTitle = useMemo(
    () =>
      searchKeyword
        ? translateText(["noSearchResultsTitle"], {
            searchKeyword: `'${searchKeyword}'`
          })
        : translateText(["noSearchResultsTitle"]),
    [translateText, searchKeyword]
  );

  // -------------------------------------------------------------------------
  // Columns
  // -------------------------------------------------------------------------

  const columnHeaders = useMemo(
    (): Column<DealRow>[] => [
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
    ],
    [translateText]
  );

  // -------------------------------------------------------------------------
  // Rows
  // -------------------------------------------------------------------------

  const tableRows = useMemo(
    (): DealRow[] =>
      allDeals.map((deal: CrmDealListItemType) => {
        const stageColor = deal.stageColor;
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
                : "-"}
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
          companyName: <span className="body2">{deal.companyName ?? "-"}</span>,
          contactName: <span className="body2">{deal.contactName}</span>,
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
      }),
    [allDeals]
  );

  const tableData = useMemo(
    (): GroupData<DealRow>[] => [{ items: tableRows }],
    [tableRows]
  );

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div className="w-full h-[600px] flex rounded-lg shadow-[0px_2px_8px_0px_rgba(0,0,0,0.12)] [&_table]:!w-full [&_table]:!min-w-full">
      {isLoading ? (
        <table className="w-full">
          <ProjectTableSkeletonLoader rowCount={8} />
        </table>
      ) : (
        <ListTable<DealRow>
          columnHeaders={columnHeaders}
          data={tableData}
          hasMore={hasNextPage ?? false}
          onLoadMore={onLoadMore}
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
          infiniteScrollLoadingMessage={translateText([
            "infiniteScrollLoadingMessage"
          ])}
        />
      )}
    </div>
  );
};

export default DealsTable;
