import React from "react";

const DealCardSkeleton: React.FC = () => (
  <div className="w-full animate-pulse rounded-lg bg-white p-3 outline outline-1 outline-secondary-accent">
    {/* Row 1: icon + ID · avatar */}
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-secondary-accent" />
        <div className="h-3 w-16 rounded bg-secondary-accent" />
      </div>
      <div className="h-7 w-7 rounded-full bg-secondary-accent" />
    </div>
    {/* Row 2: title */}
    <div className="mt-3 space-y-1.5">
      <div className="h-3 w-full rounded bg-secondary-accent" />
      <div className="h-3 w-3/4 rounded bg-secondary-accent" />
    </div>
    {/* Row 3: contact · company */}
    <div className="mt-3 h-3 w-2/3 rounded bg-secondary-accent" />
    {/* Row 4: value */}
    <div className="mt-3 flex items-center gap-1.5">
      <div className="h-4 w-4 rounded bg-secondary-accent" />
      <div className="h-3 w-20 rounded bg-secondary-accent" />
    </div>
    {/* Row 5: chip + badge */}
    <div className="mt-3 flex items-center justify-end gap-2">
      <div className="h-6 w-14 rounded-full bg-secondary-accent" />
      <div className="h-7 w-7 rounded-full bg-secondary-accent" />
    </div>
  </div>
);

export default DealCardSkeleton;
