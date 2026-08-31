import {
  BaseRowData,
  Column,
  GroupData,
  ListTable,
  ProjectTableSkeletonLoader,
  SortConfig
} from "@rootcodelabs/skapp-ui";
import { FC, ReactNode, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import HandshakeIcon from "~community/common/assets/Icons/HandshakeIcon";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useContainerWidth } from "~community/crm/components/organisms/DealsTable/utils/dealsTableUtils";
import useStageNameMapper from "~community/crm/hooks/useStageNameMapper";
import OwnerAvatarChip from "~community/crm/v2/components/atoms/OwnerAvatarChip/OwnerAvatarChip";
import PriorityLabel from "~community/crm/v2/components/atoms/PriorityLabel/PriorityLabel";
import StageLabel from "~community/crm/v2/components/atoms/StageLabel/StageLabel";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { CrmDealEntity } from "~community/crm/v2/types/CrmCommonTypes";
import {
  CrmDealColumnFieldEnum,
  CrmDealListViewConfig
} from "~community/crm/v2/types/CrmListViewConfigTypes";
import { formatCurrency } from "~community/crm/v2/utils/commonUtil";
import { getContactDisplayName } from "~community/crm/v2/utils/contactUtil";

interface DealRow extends BaseRowData {
  id: string;
  dealName: ReactNode;
  value: ReactNode;
  stage: ReactNode;
  companyName: ReactNode;
  contactName: ReactNode;
  priority: ReactNode;
  dealOwner: ReactNode;
}

/** Maps a config field to the `DealRow` key that renders it and its i18n title key. */
const FIELD_META: Record<
  CrmDealColumnFieldEnum,
  { rowKey: keyof DealRow; titleKey: string; minWidth: number }
> = {
  [CrmDealColumnFieldEnum.DEAL_NAME]: {
    rowKey: "dealName",
    titleKey: "dealColumn",
    minWidth: 400
  },
  [CrmDealColumnFieldEnum.VALUE]: {
    rowKey: "value",
    titleKey: "valueColumn",
    minWidth: 140
  },
  [CrmDealColumnFieldEnum.STAGE]: {
    rowKey: "stage",
    titleKey: "stageColumn",
    minWidth: 140
  },
  [CrmDealColumnFieldEnum.COMPANY_NAME]: {
    rowKey: "companyName",
    titleKey: "companyNameColumn",
    minWidth: 140
  },
  [CrmDealColumnFieldEnum.CONTACT_NAME]: {
    rowKey: "contactName",
    titleKey: "contactNameColumn",
    minWidth: 140
  },
  [CrmDealColumnFieldEnum.PRIORITY]: {
    rowKey: "priority",
    titleKey: "priorityColumn",
    minWidth: 140
  },
  [CrmDealColumnFieldEnum.DEAL_OWNER]: {
    rowKey: "dealOwner",
    titleKey: "dealOwnerColumn",
    minWidth: 140
  }
};

interface Props {
  searchKeyword: string;
  isLoading: boolean;
  deals: CrmDealEntity[];
  hasNextPage: boolean;
  onLoadMore: () => Promise<void>;
  onDealClick?: (dealId: number) => void;
  columnConfig: CrmDealListViewConfig | null;
  sortConfig: SortConfig[];
  onColumnReorder: (columns: Column<DealRow>[]) => void;
  onColumnVisibilityChange: (columns: Column<DealRow>[]) => void;
  onColumnResize: (columnId: string, width: number) => void;
  onSort: (sortConfig: SortConfig[]) => void;
  enableRowReorder: boolean;
  onRowReorder: (movingId: string, previousId?: string, nextId?: string) => void;
}

const DealsTableV2: FC<Props> = ({
  searchKeyword,
  isLoading,
  deals,
  hasNextPage,
  onLoadMore,
  onDealClick,
  columnConfig,
  sortConfig,
  onColumnReorder,
  onColumnVisibilityChange,
  onColumnResize,
  onSort,
  enableRowReorder,
  onRowReorder
}) => {
  const translateText = useTranslator("crmModule", "deals", "dealsTable");
  const { getStageByName } = useStageNameMapper();

  const noSearchResultsTitle = translateText(["noSearchResultsTitle"], {
    searchKeyword: `'${searchKeyword}'`
  });

  const [containerRef] = useContainerWidth();

  const { stages, companies, contacts, owners } = useCrmStoreV2(
    useShallow((store) => ({
      stages: store.stages,
      companies: store.companies,
      contacts: store.contacts,
      owners: store.owners
    }))
  );

  const columnHeaders = useMemo((): Column<DealRow>[] => {
    const fields = columnConfig?.fields ?? [];
    return fields.map((fieldConfig): Column<DealRow> => {
      const meta = FIELD_META[fieldConfig.field];
      return {
        id: fieldConfig.field,
        title: translateText([meta.titleKey]),
        field: meta.rowKey,
        width: fieldConfig.width,
        minWidth: meta.minWidth,
        resizable: fieldConfig.isResizable,
        draggable: fieldConfig.isDraggable,
        sortable: fieldConfig.isSortable,
        // Non-hideable columns (e.g. deal name) stay visible.
        visible: fieldConfig.isHideable ? fieldConfig.isVisible : true
      };
    });
  }, [columnConfig, translateText]);

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
              {formatCurrency(deal.amount)}
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
          priority: <PriorityLabel priority={deal.priority} showLabel />,
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

  if (isLoading || !columnConfig) {
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
        onColumnReorder={onColumnReorder}
        onColumnVisibilityChange={onColumnVisibilityChange}
        onColumnResize={onColumnResize}
        // ListTable matches rowDragColumn against column.id at runtime while typing
        // it as keyof T, so the drag handle is pinned to the Deal Name column by id.
        rowDragColumn={
          enableRowReorder
            ? (CrmDealColumnFieldEnum.DEAL_NAME as unknown as keyof DealRow)
            : undefined
        }
        onRowReorder={enableRowReorder ? onRowReorder : undefined}
        showColumnVisibilityToggle
        showKebabMenu
        sortConfig={sortConfig}
        onSort={onSort}
        menuLabels={{
          sortAscending: translateText(["sortAscending"]),
          sortDescending: translateText(["sortDescending"]),
          hideField: translateText(["hideColumn"])
        }}
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
        infiniteScrollLoadingMessage={translateText([
          "infiniteScrollLoadingMessage"
        ])}
      />
    </div>
  );
};

export default DealsTableV2;
