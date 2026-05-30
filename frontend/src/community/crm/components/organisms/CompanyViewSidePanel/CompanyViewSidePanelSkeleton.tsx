import { FC } from "react";

const pulse = "animate-pulse bg-tertiary-background rounded";

const CompanyViewSidePanelSkeleton: FC = () => (
  <div className="flex flex-col gap-6 p-6">
    {/* Company info header skeleton */}
    <div className="flex flex-col gap-3 animate-pulse">
      <div className="flex items-center justify-between max-w-[75%]">
        {[86, 68, 34, 50].map((w, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className={`h-[20px] w-[20px] shrink-0 ${pulse}`} />
            <div className={`h-[14px] ${pulse}`} style={{ width: `${w}px` }} />
          </div>
        ))}
      </div>
    </div>

    {/* Metric cards skeleton */}
    <div className="flex gap-4 w-full">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="flex flex-col gap-2 flex-1 min-w-0 p-3 border border-secondary-accent rounded-lg animate-pulse"
        >
          <div className={`h-[14px] w-[60px] ${pulse}`} />
          <div className={`h-[18px] w-[80px] ${pulse}`} />
        </div>
      ))}
    </div>

    {/* Deals accordion skeleton — one open */}
    <div className="flex flex-col gap-4 animate-pulse">
      <div className={`h-[16px] w-[50px] ${pulse}`} />
      <hr className="border-secondary-accent" />
      {/* Closed accordion rows */}
      {[0, 1].map((i) => (
        <div
          key={i}
          className="flex items-center justify-between p-3 border border-secondary-accent rounded-lg"
        >
          <div className="flex flex-col gap-1">
            <div className={`h-[14px] w-[120px] ${pulse}`} />
            <div className={`h-[10px] w-[80px] ${pulse}`} />
          </div>
          <div className={`h-[24px] w-[70px] rounded-full ${pulse}`} />
        </div>
      ))}
      {/* Open accordion row */}
      <div className="flex flex-col gap-3 p-3 border border-secondary-accent rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <div className={`h-[14px] w-[120px] ${pulse}`} />
            <div className={`h-[10px] w-[80px] ${pulse}`} />
          </div>
          <div className={`h-[24px] w-[70px] rounded-full ${pulse}`} />
        </div>
        <div className="flex flex-col gap-1 pt-2 border-t border-secondary-accent">
          <div className={`h-[12px] w-[80px] ${pulse}`} />
          <div className={`h-[12px] w-[160px] ${pulse}`} />
        </div>
      </div>
    </div>

    {/* Contacts section skeleton */}
    <div className="flex flex-col gap-4 animate-pulse">
      <div className={`h-[16px] w-[60px] ${pulse}`} />
      <hr className="border-secondary-accent" />
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-center gap-3">
          <div className={`h-[32px] w-[32px] rounded-full shrink-0 ${pulse}`} />
          <div className="flex flex-col gap-1">
            <div className={`h-[14px] w-[100px] ${pulse}`} />
            <div className={`h-[10px] w-[140px] ${pulse}`} />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default CompanyViewSidePanelSkeleton;
