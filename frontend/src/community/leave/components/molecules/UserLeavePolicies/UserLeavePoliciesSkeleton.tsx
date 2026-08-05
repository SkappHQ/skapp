import { FC } from "react";

const SKELETON_CARD_COUNT = 6;

const UserLeavePoliciesSkeleton: FC = () => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: SKELETON_CARD_COUNT }).map((_, index) => (
      <div
        key={index}
        className="h-20 animate-pulse rounded-lg bg-tertiary-background"
      />
    ))}
  </div>
);

export default UserLeavePoliciesSkeleton;
