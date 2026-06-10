import {
  AvatarChip,
  BaseRowData,
  Column,
  GroupData,
  ListTable,
  ProjectTableSkeletonLoader
} from "@rootcodelabs/skapp-ui";
import { FC, ReactNode, useMemo } from "react";

import HandshakeIcon from "~community/common/assets/Icons/HandshakeIcon";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { CrmDealListItem } from "~community/crm/types/CommonTypes";
import { concatStrings } from "~community/common/utils/commonUtil";
import { formatValue } from "~community/crm/utils/crmUtil";
import { DEAL_TABLE_COLUMN_WIDTH_RATIO } from "~community/crm/constants/dealConstants";
import { useContainerWidth } from "./utils/dealsTableUtils";

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
  allDeals: CrmDealListItem[];
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

  const [containerRef, tableWidth] = useContainerWidth();

  const columnHeaders = useMemo(
    (): Column<DealRow>[] => [
      {
        id: "dealName",
        title: translateText(["dealColumn"]),
        field: "dealName",
        width: tableWidth * DEAL_TABLE_COLUMN_WIDTH_RATIO.DEAL_NAME,
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
        width: tableWidth * DEAL_TABLE_COLUMN_WIDTH_RATIO.VALUE,
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
        width: tableWidth * DEAL_TABLE_COLUMN_WIDTH_RATIO.STAGE,
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
        width: tableWidth * DEAL_TABLE_COLUMN_WIDTH_RATIO.COMPANY_NAME,
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
        width: tableWidth * DEAL_TABLE_COLUMN_WIDTH_RATIO.CONTACT_NAME,
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
        width: tableWidth * DEAL_TABLE_COLUMN_WIDTH_RATIO.DEAL_OWNER,
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
      allDeals.map((deal: CrmDealListItem) => {
        const formattedAmount = formatValue(deal.amount);
        const ownerFullName = concatStrings([deal.owner?.firstName, deal.owner?.lastName ?? ""]);

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
      className="h-150 rounded-lg shadow-lg"
    >
      <ListTable<DealRow>
        columnHeaders={columnHeaders}
        data={tableData}
        hasMore={hasNextPage}
        onLoadMore={onLoadMore}
        emptyStateTitle={
          searchKeyword.trim() ? noSearchResultsTitle : translateText(["noDealsTitle"])
        }
        emptyStateDescription={
          searchKeyword.trim()
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
