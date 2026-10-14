import { FC } from "react";

const NotificationRowSkeleton: FC = () => (
  <div className="flex w-full flex-row gap-4 border-b border-secondary-accent py-3">
    <div className="flex items-start gap-4">
      <div className="flex h-9 w-2 items-center gap-4">
        <div className="size-2 rounded-full bg-tertiary-background" />
      </div>
      <div className="size-9 animate-pulse rounded-full bg-tertiary-background" />
    </div>
    <div className="flex flex-1 flex-col gap-2">
      <div className="h-3.5 w-4/5 animate-pulse rounded bg-tertiary-background" />
      <div className="h-2.5 w-[15%] animate-pulse rounded bg-tertiary-background" />
    </div>
  </div>
);

interface Props {
  rows?: number;
}

const NotificationsSkeleton: FC<Props> = ({ rows = 3 }) => (
  <div className="flex flex-col gap-3 pb-5">
    <div className="h-3 w-[60px] animate-pulse rounded bg-tertiary-background" />
    <div>
      {Array.from({ length: rows }, (_, i) => (
        <NotificationRowSkeleton key={i} />
      ))}
    </div>
  </div>
);

export default NotificationsSkeleton;
