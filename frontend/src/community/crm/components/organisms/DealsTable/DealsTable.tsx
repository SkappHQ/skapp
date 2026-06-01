import {
  AvatarChip,
  BaseRowData,
  Column,
  GroupData,
  ListTable,
  ProjectTableSkeletonLoader
} from "@rootcodelabs/skapp-ui";
import { FC, ReactNode, useEffect, useMemo, useRef, useState } from "react";

import HandshakeIcon from "~community/common/assets/Icons/HandshakeIcon";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { CrmDealListItemType } from "~community/crm/types/CommonTypes";
import { getFullName } from "~community/common/utils/commonUtil";
import { formatValue } from "~community/crm/utils/crmUtil";

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

const DealsTable: FC<Props> = ({
  searchKeyword,
  isLoading,
  allDeals,
  hasNextPage,
  onLoadMore
}) => {
  const translateText = useTranslator("crmModule", "deals", "dealsTable");

  const noSearchResultsTitle = translateText(["noSearchResultsTitle"], {
    searchKeyword: `'${searchKeyword}'`
  });

  const [tableWidth, setTableWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    setTableWidth(container.getBoundingClientRect().width);

    const observer = new ResizeObserver(() => {
      setTableWidth(container.getBoundingClientRect().width);
    });
    observer.observe(container);

    return () => observer.disconnect();
  }, [isLoading]);

  const columnHeaders = useMemo(
    (): Column<DealRow>[] => [
      {
        id: "dealName",
        title: translateText(["dealColumn"]),
        field: "dealName",
        width: tableWidth * 0.2337,
        minWidth: 400,
        resizable: false,
        draggable: false,
        visible: true,
        sortable: false
      },
      {
        id: "value",
        title: translateText(["valueColumn"]),
        field: "value",
        width: tableWidth * 0.1532,
        minWidth: 140,
        resizable: false,
        draggable: false,
        visible: true,
        sortable: false
      },
      {
        id: "stage",
        title: translateText(["stageColumn"]),
        field: "stage",
        width: tableWidth * 0.1532,
        minWidth: 140,
        resizable: false,
        draggable: false,
        visible: true,
        sortable: false
      },
      {
        id: "companyName",
        title: translateText(["companyNameColumn"]),
        field: "companyName",
        width: tableWidth * 0.1532,
        minWidth: 140,
        resizable: false,
        draggable: false,
        visible: true,
        sortable: false
      },
      {
        id: "contactName",
        title: translateText(["contactNameColumn"]),
        field: "contactName",
        width: tableWidth * 0.1532,
        minWidth: 140,
        resizable: false,
        draggable: false,
        visible: true,
        sortable: false
      },
      {
        id: "dealOwner",
        title: translateText(["dealOwnerColumn"]),
        field: "dealOwner",
        width: tableWidth * 0.1532,
        minWidth: 140,
        resizable: false,
        draggable: false,
        visible: true,
        sortable: false
      }
    ],
    [tableWidth, translateText]
  );

  const tableRows = useMemo(
    (): DealRow[] =>
      allDeals.map((deal: CrmDealListItemType) => {
        const formattedAmount = formatValue(deal.amount);
        const ownerFullName = getFullName(deal.owner.firstName, deal.owner.lastName);

        return {
          id: String(deal.id),
          dealName: (
            <div className="flex items-center gap-2">
              <div
                className="flex items-center justify-center size-6 rounded-full shrink-0 bg-teal-500"
              >
                <HandshakeIcon width="14" height="14" fill="var(--color-white)" />
              </div>
              <span className="body2">#{deal.id}</span>
              <span className="body2">{deal.name}</span>
            </div>
          ),
          value: (
            <span className="body2 w-full block text-right">
              {formattedAmount}
            </span>
          ),
          stage: (
            <div className="inline-flex items-center gap-2">
              <div
                className="size-2 rounded-full shrink-0"
                style={{ backgroundColor: deal.stageColor }}
              />
              <span className="body2">{deal.stageName}</span>
            </div>
          ),
          companyName: <span className="body2">{deal.companyName ?? "-"}</span>,
          contactName: <span className="body2">{deal.contactName ?? "-"}</span>,
          dealOwner: (
            <AvatarChip
              avatarProps={{
                id: String(deal.owner.employeeId),
                firstName: deal.owner.firstName,
                lastName: deal.owner.lastName ?? "",
                src: deal?.owner?.authPic ?? "",
                size: "sm"
              }}
              label={ownerFullName}
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

  if (isLoading) {
    return (
      <div className="w-fit h-150 rounded-lg shadow-lg overflow-hidden">
        <ProjectTableSkeletonLoader rowCount={8} />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-150 rounded-lg shadow-lg [&>div]:overflow-x-hidden! [&>div]:overflow-y-auto!"
    >
      <ListTable<DealRow>
        columnHeaders={columnHeaders}
        data={tableData}
        hasMore={hasNextPage}
        onLoadMore={onLoadMore}
        emptyStateTitle={
          searchKeyword ? noSearchResultsTitle : translateText(["noDealsTitle"])
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
    </div>
  );
};

export default DealsTable;
