import { FC } from "react";

const BusinessUnitCardSkeleton: FC = () => (
  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
    <div className="mb-0 h-[84px] w-full animate-pulse rounded-lg bg-tertiary-background" />
    <div className="mb-0 h-[84px] w-full animate-pulse rounded-lg bg-tertiary-background" />
    <div className="mb-0 h-[84px] w-full animate-pulse rounded-lg bg-tertiary-background" />
  </div>
);

export default BusinessUnitCardSkeleton;
