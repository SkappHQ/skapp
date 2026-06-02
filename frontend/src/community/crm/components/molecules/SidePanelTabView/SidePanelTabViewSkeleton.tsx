import { FC } from "react";

interface Props {
  tabCount?: number;
}

const SidePanelTabViewSkeleton: FC<Props> = ({ tabCount = 2 }) => (
  <div className="animate-pulse border-b border-secondary-accent flex gap-1">
    {Array.from({ length: tabCount }).map((_, i) => (
      <div key={i} className="h-[37px] w-[72px] rounded-t-[4px] bg-gray-100" />
    ))}
  </div>
);

export default SidePanelTabViewSkeleton;
