import { FC } from "react";

import SkeletonBlock from "./SkeletonBlock";
import SkeletonCircle from "./SkeletonCircle";

interface Props {
  tabCount: number;
}

const SidePanelTabsSkeleton: FC<Props> = ({ tabCount }) => (
  <div className="flex flex-col gap-3 w-full" aria-hidden="true">
    <div className="flex flex-col">
      <div className="flex">
        {Array.from({ length: tabCount }).map((_, i) => (
          <div
            key={i}
            className={`px-5 py-2 border-b-2 ${
              i === 0
                ? "rounded-tl-lg"
                : i === tabCount - 1
                  ? "rounded-tr-lg"
                  : ""
            } ${
              i === 0
                ? "border-primary-text bg-primary-background"
                : "border-transparent bg-secondary-background"
            }`}
          >
            <SkeletonBlock className="h-2.5 w-6" />
          </div>
        ))}
      </div>
      <hr className="border-secondary-accent" />
    </div>

    <div className="border border-secondary-accent rounded-lg divide-y divide-secondary-accent w-full overflow-hidden">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between px-3 py-3">
          <div className="flex items-center gap-4">
            {i === 0 ? (
              <SkeletonCircle className="h-6 w-6 shrink-0" />
            ) : (
              <SkeletonBlock className="h-6 w-6 shrink-0" />
            )}
            <div className="flex items-center gap-3">
              <SkeletonCircle className="h-5 w-5 shrink-0" />
              <div className="flex flex-col gap-1">
                <SkeletonBlock className="h-2.5 w-17.75" />
                <SkeletonBlock className="h-2 w-12" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <SkeletonCircle className="h-8 w-8" />
            <SkeletonBlock className="h-6 w-6" />
          </div>
        </div>
      ))}
    </div>

    <div className="flex items-center gap-2">
      <SkeletonBlock className="h-4 w-16" />
      <SkeletonBlock className="h-4 w-4" />
    </div>
  </div>
);

export default SidePanelTabsSkeleton;
