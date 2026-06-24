import { FC } from "react";

import SkeletonShape from "~community/crm/components/atoms/SkeletonShape/SkeletonShape";

interface Props {
  tabCount: number;
}

const getTabRoundedClass = (i: number, tabCount: number): string => {
  if (i === 0) return "rounded-tl-lg";
  if (i === tabCount - 1) return "rounded-tr-lg";
  return "";
};

const SidePanelTabsSkeleton: FC<Props> = ({ tabCount }) => (
  <div className="flex flex-col gap-3 w-full" aria-hidden="true">
    <div className="flex flex-col">
      <div className="flex">
        {Array.from({ length: tabCount }).map((_, i) => (
          <div
            key={`tab-skeleton-${i}`}
            className={`px-5 py-2 border-b-2 ${getTabRoundedClass(i, tabCount)} ${
              i === 0
                ? "border-primary-text bg-primary-background"
                : "border-transparent bg-secondary-background"
            }`}
          >
            <SkeletonShape className="h-2.5 w-6" />
          </div>
        ))}
      </div>
      <hr className="border-secondary-accent" />
    </div>

    <div className="border border-secondary-accent rounded-lg divide-y divide-secondary-accent w-full overflow-hidden">
      <div className="flex items-center justify-between px-3 py-3">
        <div className="flex items-center gap-4">
          <SkeletonShape circle className="h-6 w-6 shrink-0" />
          <div className="flex items-center gap-3">
            <SkeletonShape circle className="h-5 w-5 shrink-0" />
            <div className="flex flex-col gap-1">
              <SkeletonShape className="h-2.5 w-17.75" />
              <SkeletonShape className="h-2 w-12" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <SkeletonShape circle className="h-8 w-8" />
          <SkeletonShape className="h-6 w-6" />
        </div>
      </div>
      <div className="flex items-center justify-between px-3 py-3">
        <div className="flex items-center gap-4">
          <SkeletonShape className="h-6 w-6 shrink-0" />
          <div className="flex items-center gap-3">
            <SkeletonShape circle className="h-5 w-5 shrink-0" />
            <div className="flex flex-col gap-1">
              <SkeletonShape className="h-2.5 w-17.75" />
              <SkeletonShape className="h-2 w-12" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <SkeletonShape circle className="h-8 w-8" />
          <SkeletonShape className="h-6 w-6" />
        </div>
      </div>
      <div className="flex items-center justify-between px-3 py-3">
        <div className="flex items-center gap-4">
          <SkeletonShape className="h-6 w-6 shrink-0" />
          <div className="flex items-center gap-3">
            <SkeletonShape circle className="h-5 w-5 shrink-0" />
            <div className="flex flex-col gap-1">
              <SkeletonShape className="h-2.5 w-17.75" />
              <SkeletonShape className="h-2 w-12" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <SkeletonShape circle className="h-8 w-8" />
          <SkeletonShape className="h-6 w-6" />
        </div>
      </div>
      <div className="flex items-center justify-between px-3 py-3">
        <div className="flex items-center gap-4">
          <SkeletonShape className="h-6 w-6 shrink-0" />
          <div className="flex items-center gap-3">
            <SkeletonShape circle className="h-5 w-5 shrink-0" />
            <div className="flex flex-col gap-1">
              <SkeletonShape className="h-2.5 w-17.75" />
              <SkeletonShape className="h-2 w-12" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <SkeletonShape circle className="h-8 w-8" />
          <SkeletonShape className="h-6 w-6" />
        </div>
      </div>
    </div>

    <div className="flex items-center gap-2">
      <SkeletonShape className="h-4 w-16" />
      <SkeletonShape className="h-4 w-4" />
    </div>
  </div>
);

export default SidePanelTabsSkeleton;
