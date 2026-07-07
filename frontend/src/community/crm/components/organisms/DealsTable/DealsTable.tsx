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
import useGetImageUrl from "~community/common/hooks/useGetImageUrl";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { concatStrings } from "~community/common/utils/commonUtil";
import { DEAL_TABLE_COLUMN_WIDTH_RATIO } from "~community/crm/constants/dealConstants";
import { STAGE_COLOR_MAP } from "~community/crm/constants/stageConstants";
import useStageNameMapper from "~community/crm/hooks/useStageNameMapper";
import { CrmDealListItem } from "~community/crm/types/CommonTypes";
import { formatValue } from "~community/crm/utils/crmUtil";

import { useContainerWidth } from "./utils/dealsTableUtils";

interface OwnerCellProps {
  owner: CrmDealListItem["owner"];
}

const OwnerCell: FC<OwnerCellProps> = ({ owner }) => {
  const fullName = concatStrings([owner.firstName, owner.lastName ?? ""]);
  const imageUrl = useGetImageUrl(owner.authPic ?? "");

  return (
    <AvatarChip
      avatarProps={{
        id: String(owner.employeeId),
        firstName: owner.firstName,
        lastName: owner.lastName ?? "",
        src: imageUrl ?? "",
        size: "sm"
      }}
      label={fullName}
      backgroundColor="bg-secondary-background"
    />
  );
};

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
  onDealClick?: (deal: CrmDealListItem) => void;
}

const DealsTable: FC<Props> = ({
  searchKeyword,
  isLoading,
  allDeals,
  hasNextPage,
  onLoadMore,
  onDealClick
}) => {
  const translateText = useTranslator("crmModule", "deals", "dealsTable");
  const { getStageByName } = useStageNameMapper();

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

        return {
          id: String(deal.id),
          dealName: (
            <div
              role="button"
              tabIndex={0}
              className="flex items-center gap-2 bg-transparent border-none p-0 cursor-pointer group"
              aria-label={translateText(["openDealDetails"], { name: deal.name })}
              onClick={() => onDealClick?.(deal)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onDealClick?.(deal);
                }
              }}
            >
              <div className="flex items-center justify-center size-6 rounded-full shrink-0 bg-status-pink">
                <HandshakeIcon
                  width="14"
                  height="14"
                  fill="var(--color-white)"
                />
              </div>
              <span className="body2 group-hover:underline">#{deal.id}</span>
              <span
                className="body2 group-hover:underline block w-full truncate"
                title={deal.name}
              >
                {deal.name}
              </span>
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
                style={{ backgroundColor: STAGE_COLOR_MAP[deal.stage.color] }}
              />
              <span className="body2">{getStageByName(deal.stage.name)}</span>
            </div>
          ),
          companyName: (
            <span
              className="body2 block w-full truncate"
              title={deal?.companyName ?? undefined}
            >
              {deal?.companyName ?? "-"}
            </span>
          ),
          contactName: (
            <span
              className="body2 block w-full truncate"
              title={deal.contactName}
            >
              {deal.contactName}
            </span>
          ),
          dealOwner: <OwnerCell owner={deal.owner} />
        };
      }),
    [allDeals, getStageByName]
  );

  const tableData = useMemo(
    (): GroupData<DealRow>[] => [{ items: tableRows }],
    [tableRows]
  );

  if (isLoading) {
    return (
      <div className="w-fit h-full rounded-lg overflow-hidden">
        <ProjectTableSkeletonLoader rowCount={8} />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="rounded-lg h-full overflow-y-auto">
      <ListTable<DealRow>
        columnHeaders={columnHeaders}
        data={tableData}
        hasMore={hasNextPage}
        onLoadMore={onLoadMore}
        emptyStateTitle={
          searchKeyword.trim()
            ? noSearchResultsTitle
            : translateText(["noDealsTitle"])
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
