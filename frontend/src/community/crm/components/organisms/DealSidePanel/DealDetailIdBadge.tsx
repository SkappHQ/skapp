import { FC } from "react";

import HandshakeIcon from "~community/common/assets/Icons/HandshakeIcon";

interface DealDetailIdBadgeProps {
  dealId: number;
}

const DealDetailIdBadge: FC<DealDetailIdBadgeProps> = ({ dealId }) => (
  <div className="flex items-center gap-2">
    <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-status-pink">
      <HandshakeIcon width="14" height="14" fill="var(--color-white)" />
    </div>
    <span className="body1 text-secondary-icon">#{dealId}</span>
  </div>
);

export default DealDetailIdBadge;
