import { Label } from "@rootcodelabs/skapp-ui";
import { ReactNode } from "react";

import { CrmCompanyMetricsType } from "../types/CommonTypes";

type NumericValue = string | number | null;

export const formatCurrency = (value: NumericValue): ReactNode => {
  if (value == null || value === 0) return <div className="text-right">-</div>;
  return <div className="flex items-baseline tabular-nums justify-end">{`$${value}`}</div>;
};

export const formatPhoneNumber = (value: NumericValue): ReactNode => {
  if (value == null) return "-";
  return <div className="flex items-baseline">{`+${value}`}</div>;
};

export const formatTasks = (
  value: NumericValue,
  row: CrmCompanyMetricsType
): ReactNode => {
  if (value == null || value === 0) return "-";
  return (
    <div className="flex flex-row items-center gap-2 tabular-nums">
      <div className="text-gray-900">{`${value}`}</div>
      {row.overdue > 0 && (
        <Label
          backgroundColor="bg-red-100"
          textColor="text-red-900"
        >{`${row.overdue} overdue`}</Label>
      )}
    </div>
  );
};

export const formatAccountValue = (
  value: NumericValue,
  row: CrmCompanyMetricsType
): ReactNode => {
  if (value == null || value === 0) return <div className="text-right">-</div>;
  return (
    <div className="flex flex-col gap-1 text-right">
      <div className="text-gray-900">{`$${value}`}</div>
      <div className="text-sm text-slate-600">{`${row.closedDeals} Deals closed`}</div>
    </div>
  );
};
