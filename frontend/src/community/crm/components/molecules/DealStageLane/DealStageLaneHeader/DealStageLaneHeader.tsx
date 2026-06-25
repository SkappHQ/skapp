import { useDroppable } from "@dnd-kit/core";
import { FC, ReactNode } from "react";

import { CrmDealStageType } from "~community/crm/types/CommonTypes";
import { getAccentColor } from "~community/crm/utils/kanbanUtil";

export interface DealStageLaneHeaderProps {
  stage: CrmDealStageType;
  totalValue: string;
  totalCount: number;
  isOver?: boolean;
  children: ReactNode;
}

const DealStageLaneHeader: FC<DealStageLaneHeaderProps> = ({
  stage,
  totalValue,
  totalCount,
  isOver = false,
  children
}) => {
  const accentColor = getAccentColor(stage.color);

  const { setNodeRef } = useDroppable({
    id: stage.id,
    data: { type: "stage", stageId: stage.id }
  });

  return (
    <section
      ref={setNodeRef}
      className={`flex h-full w-75 shrink-0 flex-col rounded-lg bg-tertiary-background outline-1 transition-shadow ${
        isOver
          ? "outline-primary-accent ring-2 ring-primary-background"
          : "outline-secondary-accent"
      }`}
      aria-labelledby={`crm-stage-${stage.id}`}
    >
      <div
        className="h-1.75 rounded-lg m-2"
        style={{ backgroundColor: accentColor }}
      />

      <div className="flex items-center justify-between gap-2 px-3 pt-3">
        <div className="min-w-0">
          <h2
            id={`crm-stage-${stage.id}`}
            className="subtitle1 truncate capitalize"
          >
            {stage.name}
          </h2>
          <p className="body3 mt-0.5 text-secondary-icon">{totalValue}</p>
        </div>
        <span className="flex h-8 min-w-8 shrink-0 items-center justify-center rounded-full body3 bg-white px-1.5 text-secondary-text">
          {totalCount}
        </span>
      </div>

      {children}
    </section>
  );
};

export default DealStageLaneHeader;
