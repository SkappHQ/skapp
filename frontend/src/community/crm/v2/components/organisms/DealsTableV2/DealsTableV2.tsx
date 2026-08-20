import {
  BaseRowData,
  Column,
  GroupData,
  ListTable,
  ProjectTableSkeletonLoader
} from "@rootcodelabs/skapp-ui";
import { FC, ReactNode, useMemo } from "react";

import HandshakeIcon from "~community/common/assets/Icons/HandshakeIcon";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { DEAL_TABLE_COLUMN_WIDTH_RATIO } from "~community/crm/constants/dealConstants";
import { useContainerWidth } from "~community/crm/components/organisms/DealsTable/utils/dealsTableUtils";
import useStageNameMapper from "~community/crm/hooks/useStageNameMapper";
import OwnerAvatarChip from "~community/crm/v2/components/atoms/OwnerAvatarChip/OwnerAvatarChip";
import StageLabel from "~community/crm/v2/components/atoms/StageLabel/StageLabel";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { CrmDealEntity } from "~community/crm/v2/types/CrmCommonTypes";
import { getContactDisplayName } from "~community/crm/v2/utils/contactUtil";
import { formatDealAmount } from "~community/crm/v2/utils/dealUtil";

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
  deals: CrmDealEntity[];
  hasNextPage: boolean;
  onLoadMore: () => Promise<void>;
  onDealClick?: (dealId: number) => void;
}

const DealsTableV2: FC<Props> = ({
  searchKeyword,
  isLoading,
  deals,
  hasNextPage,
  onLoadMore,
  onDealClick
}) => {
  const translateText = useTranslator("crmModule", "deals", "dealsTable");
  // Map default stage names (LEAD/QUALIFIED/…) to their localized labels; custom
  // stage names pass through unchanged. Reuses the v1 i18n mapper.
  const { getStageByName } = useStageNameMapper();

  const noSearchResultsTitle = translateText(["noSearchResultsTitle"], {
    searchKeyword: `'${searchKeyword}'`
  });

  const [containerRef, tableWidth] = useContainerWidth();

  // Records the row cells resolve their scalar FKs against.
  const stages = useCrmStoreV2((state) => state.stages);
  const companies = useCrmStoreV2((state) => state.companies);
  const contacts = useCrmStoreV2((state) => state.contacts);
  const owners = useCrmStoreV2((state) => state.owners);

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
      deals.map((deal) => {
        const stage = deal.stageId != null ? stages[deal.stageId] : undefined;
        const company =
          deal.companyId != null ? companies[deal.companyId] : undefined;
        const contact =
          deal.contactId != null ? contacts[deal.contactId] : undefined;
        const owner = deal.ownerId != null ? owners[deal.ownerId] : undefined;
        const contactName = getContactDisplayName(contact);

        return {
          id: String(deal.id),
          dealName: (
            <div
              role="button"
              tabIndex={0}
              className="flex items-center gap-2 bg-transparent border-none p-0 cursor-pointer group"
              aria-label={translateText(["openDealDetails"], {
                name: deal.name
              })}
              onClick={() => deal.id != null && onDealClick?.(deal.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  if (deal.id != null) onDealClick?.(deal.id);
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
              {formatDealAmount(deal.amount)}
            </span>
          ),
          stage: (
            <StageLabel
              label={getStageByName(stage?.name ?? "") || "-"}
              color={stage?.color}
            />
          ),
          companyName: (
            <span className="body2 block w-full truncate" title={company?.name}>
              {company?.name ?? "-"}
            </span>
          ),
          contactName: (
            <span className="body2 block w-full truncate" title={contactName}>
              {contactName || "-"}
            </span>
          ),
          dealOwner: owner ? (
            <OwnerAvatarChip
              id={`deal-${deal.id}-owner-${owner.employeeId}`}
              owner={owner}
              backgroundColor="bg-secondary-background"
            />
          ) : (
            <span className="body2">-</span>
          )
        };
      }),
    [deals, stages, companies, contacts, owners, translateText, getStageByName]
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

export default DealsTableV2;
