import { FC } from "react";

const NotificationRowSkeleton: FC = () => (
  <div className="flex flex-row gap-4 w-full py-3 border-b border-secondary-accent">
    <div className="flex items-start gap-4">
      <div className="flex items-center gap-4 h-9 w-2">
        <div className="size-2 bg-tertiary-background rounded-full" />
      </div>
      <div className="size-9 rounded-full bg-tertiary-background animate-pulse" />
    </div>
    <div className="flex flex-col gap-2 flex-1">
      <div className="h-3.5 w-4/5 rounded bg-tertiary-background animate-pulse" />
      <div className="h-2.5 w-[15%] rounded bg-tertiary-background animate-pulse" />
    </div>
  </div>
);

interface Props {
  rows?: number;
}

const NotificationsSkeleton: FC<Props> = ({ rows = 3 }) => (
  <div className="flex flex-col gap-3 pb-5">
    <div className="h-3 w-15 rounded bg-tertiary-background animate-pulse" />
    <div>
      {Array.from({ length: rows }, (_, i) => (
        <NotificationRowSkeleton key={i} />
      ))}
    </div>
  </div>
);

export default NotificationsSkeleton;
