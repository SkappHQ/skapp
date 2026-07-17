import { FC } from "react";

import SkeletonBar from "./SkeletonBar";

interface Props {
  showActionsColumn: boolean;
}

const LeavePoliciesTableSkeletonRow: FC<Props> = ({ showActionsColumn }) => (
  <tr className="rounded border-b-2 border-gray-100 bg-gray-50">
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

export default LeavePoliciesTableSkeletonRow;
