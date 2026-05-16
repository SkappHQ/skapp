import { Skeleton, Stack } from "@mui/material";
import { FormatListBulletedRounded, GridViewRounded } from "@mui/icons-material";
import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { FC, useMemo, useState } from "react";

import PlusIcon from "~community/common/assets/Icons/PlusIcon";
import AvatarChip from "~community/common/components/molecules/AvatarChip/AvatarChip";
import SearchBox from "~community/common/components/molecules/SearchBox/SearchBox";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { useGetDealsForKanban, useGetDealStages } from "~community/crm/api/crmDealApi";
import { CrmDealViewMode } from "~community/crm/enums/common";
import { useCrmStore } from "~community/crm/store/store";
import { CrmDealListItemType, CrmDealStageType } from "~community/crm/types/CommonTypes";
import { useAppStore } from "../../../../../store/store";

// ---------------------------------------------------------------------------
// Priority badge helpers
// ---------------------------------------------------------------------------

const PRIORITY_COLORS: Record<string, { bg: string; text: string }> = {
  Low: { bg: "#F3F4F6", text: "#6B7280" },
  Medium: { bg: "#EFF6FF", text: "#3B82F6" },
  High: { bg: "#FFF7ED", text: "#F97316" },
  Critical: { bg: "#FEF2F2", text: "#EF4444" }
};

const getPriorityStyle = (name: string | null) =>
  PRIORITY_COLORS[name ?? ""] ?? { bg: "#F3F4F6", text: "#6B7280" };

// ---------------------------------------------------------------------------
// DealCard
// ---------------------------------------------------------------------------

interface DealCardProps {
  deal: CrmDealListItemType;
  onCardClick: (id: number) => void;
}

const DealCard: FC<DealCardProps> = ({ deal, onCardClick }) => {
  const [ownerFirst = "", ...rest] = (deal.ownerName ?? "").split(" ");
  const ownerLast = rest.join(" ");
  const priorityStyle = getPriorityStyle(deal.priorityName);

  return (
    <div
      onClick={() => onCardClick(deal.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onCardClick(deal.id)}
      className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm cursor-pointer hover:shadow-md hover:border-gray-300 transition-all"
    >
      <p className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
        {deal.name}
      </p>
      <p className="text-xs text-gray-500 mb-2">{deal.contactName}</p>

      <div className="flex items-center justify-between mt-2 flex-wrap gap-1">
        {deal.amount ? (
          <span className="text-xs font-semibold text-gray-700">
            ${Number(deal.amount).toLocaleString()}
          </span>
        ) : (
          <span className="text-xs text-gray-400">—</span>
        )}
        {deal.priorityName && (
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{
              backgroundColor: priorityStyle.bg,
              color: priorityStyle.text
            }}
          >
            {deal.priorityName}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between mt-2">
        <AvatarChip
          firstName={ownerFirst}
          lastName={ownerLast}
          avatarUrl={undefined}
          chipStyles={{ maxWidth: "fit-content" }}
        />
        {(deal.openTaskCount ?? 0) > 0 && (
          <div className="flex items-center gap-1">
            <span
              className="text-xs px-1.5 py-0.5 rounded font-medium"
              style={
                (deal.overdueTaskCount ?? 0) > 0
                  ? { backgroundColor: "#FEF2F2", color: "#EF4444" }
                  : { backgroundColor: "#F3F4F6", color: "#6B7280" }
              }
            >
              {(deal.overdueTaskCount ?? 0) > 0 && "⚠ "}
              {deal.openTaskCount} task{(deal.openTaskCount ?? 0) !== 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// KanbanColumn
// ---------------------------------------------------------------------------

interface KanbanColumnProps {
  stage: CrmDealStageType;
  deals: CrmDealListItemType[];
  onCardClick: (id: number) => void;
}

const KanbanColumn: FC<KanbanColumnProps> = ({ stage, deals, onCardClick }) => {
  return (
    <div className="flex flex-col min-w-[240px] max-w-[280px] bg-gray-50 rounded-xl flex-shrink-0">
      {/* Column header */}
      <div className="flex items-center gap-2 px-3 py-3">
        <div
          className="size-2.5 rounded-full shrink-0"
          style={{ backgroundColor: stage.color }}
        />
        <span className="text-sm font-semibold text-gray-700 truncate flex-1">
          {stage.name}
        </span>
        <span className="text-xs text-gray-400 font-medium ml-auto">
          {deals.length}
        </span>
      </div>

      {/* Deal cards */}
      <div className="flex flex-col gap-2 px-2 pb-3 overflow-y-auto max-h-[calc(100vh-280px)]">
        {deals.length === 0 ? (
          <div className="text-xs text-gray-400 text-center py-4">No deals</div>
        ) : (
          deals.map((deal) => (
            <DealCard key={deal.id} deal={deal} onCardClick={onCardClick} />
          ))
        )}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// KanbanView
// ---------------------------------------------------------------------------

interface KanbanViewProps {
  deals: CrmDealListItemType[];
  isLoading: boolean;
  searchKeyword: string;
  onCardClick: (id: number) => void;
  onAddDeal: () => void;
}

const KanbanView: FC<KanbanViewProps> = ({
  deals,
  isLoading,
  searchKeyword,
  onCardClick,
  onAddDeal
}) => {
  const translateText = useTranslator("crmModule", "deals", "dealsTable");
  const { data: stages = [] } = useGetDealStages();

  const dealsByStage = useMemo(() => {
    const map: Record<number, CrmDealListItemType[]> = {};
    stages.forEach((s) => {
      map[s.id] = [];
    });
    deals.forEach((d) => {
      if (map[d.stageId]) {
        map[d.stageId].push(d);
      } else {
        map[d.stageId] = [d];
      }
    });
    return map;
  }, [deals, stages]);

  const sortedStages = useMemo(
    () => [...stages].sort((a, b) => a.orderIndex - b.orderIndex),
    [stages]
  );

  if (isLoading) {
    return (
      <div className="flex gap-3 overflow-x-auto px-4 py-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="min-w-[240px] bg-gray-50 rounded-xl p-3 flex flex-col gap-2"
          >
            <Skeleton variant="text" width="60%" height={20} />
            {Array.from({ length: 3 }).map((_, j) => (
              <Skeleton key={j} variant="rounded" height={100} />
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (deals.length === 0) {
    return (
      <Stack
        alignItems="center"
        justifyContent="center"
        sx={{ py: 10, gap: 2 }}
      >
        <p className="text-sm text-gray-500">
          {searchKeyword
            ? translateText(["noSearchResultsTitle"]).replace(
                "{{searchKeyword}}",
                searchKeyword
              )
            : translateText(["noDealsTitle"])}
        </p>
        {!searchKeyword && (
          <ButtonV2
            variant="primary"
            onClick={onAddDeal}
            icon={<PlusIcon fill="white" />}
            iconPosition="end"
          >
            {translateText(["addDealBtn"])}
          </ButtonV2>
        )}
      </Stack>
    );
  }

  return (
    <div className="flex gap-3 overflow-x-auto px-4 py-3 pb-4">
      {sortedStages.map((stage) => (
        <KanbanColumn
          key={stage.id}
          stage={stage}
          deals={dealsByStage[stage.id] ?? []}
          onCardClick={onCardClick}
        />
      ))}
    </div>
  );
};

export default KanbanView;
