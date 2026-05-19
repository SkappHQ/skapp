import { FC } from "react";

import { MetricChipProps } from "~community/crm/types/CommonTypes";

interface Props {
  title: string;
  amount: string;
  chip?: MetricChipProps;
}

const CompanyMetricCard: FC<Props> = ({ title, amount, chip }) => {
  return (
    <div className="flex flex-col gap-1 flex-1 min-w-0 border border-secondary-accent rounded-lg p-3 overflow-hidden">
      <p className="text-sm font-normal leading-5 text-secondary-text">
        {title}
      </p>
      <div className="flex items-center gap-2">
        <p className="text-base font-semibold leading-6 text-black">
          {amount}
        </p>
        {chip && (
          <span
            className="inline-flex items-center gap-1 rounded-[30px] px-3 py-0.5 text-xs font-medium whitespace-nowrap"
            style={{ backgroundColor: chip.bgColor, color: chip.color }}
          >
            {chip.icon}
            {chip.label}
          </span>
        )}
      </div>
    </div>
  );
};

export default CompanyMetricCard;
