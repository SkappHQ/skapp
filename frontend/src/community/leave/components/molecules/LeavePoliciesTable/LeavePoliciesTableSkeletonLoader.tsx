import { FC } from "react";

import LeavePoliciesTableSkeletonRow from "./LeavePoliciesTableSkeletonRow";
import SkeletonBar from "./SkeletonBar";

interface Props {
  rowCount?: number;
  showActionsColumn?: boolean;
}

const LeavePoliciesTableSkeletonLoader: FC<Props> = ({
  rowCount = 8,
  showActionsColumn = true
}) => (
  <table className="w-full table-fixed">
    <thead className="sticky top-0 z-20 bg-tertiary-background">
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
      {Array.from({ length: rowCount }, (_, index) => (
        <LeavePoliciesTableSkeletonRow
          key={index}
          showActionsColumn={showActionsColumn}
        />
      ))}
    </tbody>
  </table>
);

export default LeavePoliciesTableSkeletonLoader;
