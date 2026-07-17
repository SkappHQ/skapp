import { FC } from "react";

interface SkeletonBarProps {
  width: string;
  className?: string;
}

const SkeletonBar: FC<SkeletonBarProps> = ({ width, className = "" }) => (
  <div
    className={`h-4 animate-pulse rounded-sm bg-neutral-200 ${width} ${className}`}
  />
);

interface Props {
  rowCount?: number;
  showActionsColumn?: boolean;
}

const LeavePoliciesTableSkeletonLoader: FC<Props> = ({
  rowCount = 8,
  showActionsColumn = true
}) => {
  const renderSkeletonRow = (index: number) => (
    <tr key={index} className="rounded border-b-2 border-gray-100 bg-gray-50">
      <td className="w-1/4 px-4 py-3">
        <SkeletonBar width="w-32" />
      </td>
      <td className="w-1/4 px-4 py-3">
        <div className="h-7 w-28 animate-pulse rounded-full bg-neutral-200" />
      </td>
      <td className="w-1/5 px-4 py-3">
        <SkeletonBar width="w-20" />
      </td>
      <td className="w-1/5 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="size-3 animate-pulse rounded-full bg-neutral-200" />
          <SkeletonBar width="w-16" />
        </div>
      </td>
      {showActionsColumn && (
        <td className="w-14 px-4 py-3">
          <div className="size-5 animate-pulse rounded-sm bg-neutral-200" />
        </td>
      )}
    </tr>
  );

  return (
    <table className="w-full table-fixed">
      <thead className="sticky top-0 z-20 bg-gray-100">
        <tr className="w-full rounded-t-sm">
          <th className="w-1/4 px-4 py-3 text-left">
            <SkeletonBar width="w-24" />
          </th>
          <th className="w-1/4 px-4 py-3 text-left">
            <SkeletonBar width="w-20" />
          </th>
          <th className="w-1/5 px-4 py-3 text-left">
            <SkeletonBar width="w-20" />
          </th>
          <th className="w-1/5 px-4 py-3 text-left">
            <SkeletonBar width="w-16" />
          </th>
          {showActionsColumn && <th className="w-14 px-4 py-3" />}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rowCount }, (_, index) => renderSkeletonRow(index))}
      </tbody>
    </table>
  );
};

export default LeavePoliciesTableSkeletonLoader;
