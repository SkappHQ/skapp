import { FC } from "react";

const TITLE_WIDTHS = ["w-24", "w-32", "w-20", "w-28"];

const SidePanelTaskRowSkeleton: FC<{ titleWidth?: string }> = ({
  titleWidth = "w-28"
}) => (
  <div className="flex items-center gap-4 p-3 min-w-0 min-h-[63px] bg-white first:rounded-t-lg last:rounded-b-lg">
    <div className="h-6 w-6 rounded-full bg-gray-100 shrink-0" />
    <div className="h-5 w-5 rounded-full bg-gray-100 shrink-0" />
    <div className="flex-1 min-w-0 flex flex-col gap-1.5">
      <div className={`h-3 ${titleWidth} rounded bg-gray-100`} />
      <div className="h-2 w-16 rounded bg-gray-100" />
    </div>
    <div className="flex items-center gap-6 shrink-0">
      <div className="h-8 w-8 rounded-full bg-gray-100" />
      <div className="h-6 w-6 rounded-full bg-gray-100" />
    </div>
  </div>
);

export const SidePanelTaskListSkeleton: FC<{ count?: number }> = ({
  count = 3
}) => (
  <div className="animate-pulse">
    <div className="border border-gray-200 rounded-lg divide-y divide-gray-200 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <SidePanelTaskRowSkeleton
          key={i}
          titleWidth={TITLE_WIDTHS[i % TITLE_WIDTHS.length]}
        />
      ))}
    </div>

    <div className="flex items-center gap-1.5 mt-2 px-1.5">
      <div className="h-2.5 w-12 rounded bg-gray-100" />
      <div className="h-4 w-4 rounded bg-gray-100" />
    </div>
  </div>
);

export default SidePanelTaskRowSkeleton;
