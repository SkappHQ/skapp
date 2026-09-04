import {
  BaseRowData,
  Column,
  GroupData,
  ListTable,
  ProjectTableSkeletonLoader,
  SortConfig
} from "@rootcodelabs/skapp-ui";
import { FC, ReactNode, useCallback, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import HandshakeIcon from "~community/common/assets/Icons/HandshakeIcon";
import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useContainerWidth } from "~community/crm/components/organisms/DealsTable/utils/dealsTableUtils";
import { useEditDeal } from "~community/crm/v2/api/DealApi";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { CrmDealEntity } from "~community/crm/v2/types/CrmCommonTypes";
import {
  CrmDealColumnFieldEnum,
  CrmDealListViewConfig
} from "~community/crm/v2/types/CrmListViewConfigTypes";
import { ingestEditedDeal } from "~community/crm/v2/utils/boardUtil";

import DealContactCell from "./DealContactCell";
import DealOwnerCell from "./DealOwnerCell";
import DealPriorityCell from "./DealPriorityCell";
import DealStageCell from "./DealStageCell";
import DealValueCell from "./DealValueCell";

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
  isConfigLoading: boolean;
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
  onRowReorder: (
    movingId: string,
    previousId?: string,
    nextId?: string
  ) => void;
}

const DealsTableV2: FC<Props> = ({
  searchKeyword,
  isLoading,
  isConfigLoading,
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
  const { setToastMessage } = useToast();

  const handleEditSuccess = (updatedDeal: CrmDealEntity): void => {
    const store = useCrmStoreV2.getState();
    const next = ingestEditedDeal(
      { deals: store.deals, board: store.board },
      updatedDeal
    );
    store.setDeals(next.deals);
    store.setBoardColumn(next.board);
  };

  const handleEditError = (): void => {
    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateText(["inlineEdit", "toastMessages", "editErrorTitle"]),
      description: translateText([
        "inlineEdit",
        "toastMessages",
        "editErrorDescription"
      ])
    });
  };

  const { mutate: editDeal } = useEditDeal(handleEditSuccess, handleEditError);

  const onInlineEdit = useCallback(
    (dealId: number | undefined, fields: Partial<CrmDealEntity>): void => {
      if (dealId == null) return;
      editDeal({ ...fields, id: dealId });
    },
    [editDeal]
  );

  const noSearchResultsTitle = translateText(["noSearchResultsTitle"], {
    searchKeyword: `'${searchKeyword}'`
  });

  const [containerRef] = useContainerWidth();

  const companies = useCrmStoreV2(useShallow((store) => store.companies));

  const columnHeaders = useMemo((): Column<DealRow>[] => {
    const fields = columnConfig?.fields ?? [];
    return fields
      .filter((fieldConfig) => FIELD_META[fieldConfig.field] != null)
      .map((fieldConfig): Column<DealRow> => {
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
          visible: fieldConfig.isHideable ? fieldConfig.isVisible : true
        };
      });
  }, [columnConfig, translateText]);

  const rowDragColumnId = useMemo(
    () => columnHeaders.find((column) => column.visible)?.id,
    [columnHeaders]
  );

  const tableRows = useMemo(
    (): DealRow[] =>
      deals.map((deal) => {
        const company =
          deal.companyId != null ? companies[deal.companyId] : undefined;

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
            <DealValueCell
              amount={deal.amount}
              onSave={(amount) => onInlineEdit(deal.id, { amount })}
            />
          ),
          stage: (
            <DealStageCell
              stageId={deal.stageId}
              onSave={(stageId) => onInlineEdit(deal.id, { stageId })}
            />
          ),
          companyName: (
            <span className="body2 block w-full truncate" title={company?.name}>
              {company?.name ?? "-"}
            </span>
          ),
          contactName: (
            <DealContactCell
              contactId={deal.contactId}
              companyId={deal.companyId}
              onSave={(contact) =>
                onInlineEdit(deal.id, { contactId: contact.id })
              }
            />
          ),
          priority: (
            <DealPriorityCell
              priority={deal.priority}
              onSave={(priority) => onInlineEdit(deal.id, { priority })}
            />
          ),
          dealOwner: (
            <DealOwnerCell
              dealId={deal.id}
              ownerId={deal.ownerId}
              onSave={(nextOwner) =>
                onInlineEdit(deal.id, { ownerId: nextOwner.employeeId })
              }
            />
          )
        };
      }),
    [deals, companies, translateText, onDealClick, onInlineEdit]
  );

  const tableData = useMemo(
    (): GroupData<DealRow>[] => [{ items: tableRows }],
    [tableRows]
  );

  if (isLoading || isConfigLoading) {
    return (
      <div className="w-fit h-full rounded-lg overflow-hidden">
        <ProjectTableSkeletonLoader rowCount={8} />
      </div>
    );
  }

  if (columnHeaders.length === 0) {
    return (
      <div className="h-full rounded-lg flex flex-col items-center justify-center gap-2 text-center">
        <p className="subtitle2">{translateText(["configErrorTitle"])}</p>
        <p className="body2 text-secondary-icon">
          {translateText(["configErrorDescription"])}
        </p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="rounded-lg h-full overflow-auto">
      <ListTable<DealRow>
        columnHeaders={columnHeaders}
        data={tableData}
        hasMore={hasNextPage}
        onLoadMore={onLoadMore}
        onColumnReorder={onColumnReorder}
        onColumnVisibilityChange={onColumnVisibilityChange}
        onColumnResize={onColumnResize}
        rowDragColumn={
          enableRowReorder
            ? (rowDragColumnId as unknown as keyof DealRow)
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
