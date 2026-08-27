import { FC } from "react";

import SkeletonShape from "~community/crm/components/atoms/SkeletonShape/SkeletonShape";
import DealCardSkeleton from "~community/crm/components/molecules/DealCardSkeleton/DealCardSkeleton";

interface DealsKanbanBoardSkeletonV2Props {
  laneCount: number;
  cardCount: number;
}

const DealsKanbanBoardSkeletonV2: FC<DealsKanbanBoardSkeletonV2Props> = ({
  laneCount,
  cardCount
}) => (
  <div
    role="status"
    aria-busy={true}
    aria-live="polite"
    className="flex h-full overflow-hidden rounded-lg border border-secondary-accent p-2"
  >
    <div className="flex h-full gap-3" aria-hidden="true">
      {Array.from({ length: laneCount }).map((_, laneIndex) => (
        <section
          key={laneIndex}
          className="flex h-full w-75 shrink-0 flex-col gap-3 rounded-lg bg-tertiary-background p-3 outline-1 outline-secondary-accent"
        >
          <div className="flex items-center justify-between">
            <SkeletonShape className="h-3 w-20" />
            <SkeletonShape circle className="h-6 w-6" />
          </div>
          <div className="flex flex-col gap-2">
            <DealCardSkeleton count={cardCount} />
          </div>
        </section>
      ))}
    </div>
  </div>
);

export default DealsKanbanBoardSkeletonV2;
