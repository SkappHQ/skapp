import { CrmIcon } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

interface DealDetailIdBadgeProps {
  dealId: number;
}

const DealDetailIdBadge: FC<DealDetailIdBadgeProps> = ({ dealId }) => (
  <div className="flex items-center gap-2">
    <div className="flex items-center justify-center size-6 rounded-full shrink-0 bg-status-pink">
      <CrmIcon width={14} height={14} color="var(--color-white)" />
    </div>
    <span className="body1 text-secondary-icon">#{dealId}</span>
  </div>
);

export default DealDetailIdBadge;
