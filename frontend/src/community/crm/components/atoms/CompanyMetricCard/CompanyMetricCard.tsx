import { FC, JSX } from "react";
import { formatCurrency } from "~community/crm/utils/formatters";

interface ChipProps {
  label: string;
  color?: string;
  bgColor?: string;
  icon?: JSX.Element;
}

interface Props {
  title: string;
  amount: string | number;
  chip?: ChipProps;
}

const CompanyMetricCard: FC<Props> = ({ title, amount, chip }) => {
  return (
    <div className="flex flex-col gap-1 flex-1 min-w-0 border border-[#d1d5dc] rounded-lg p-3 overflow-hidden">
      <p className="text-sm font-normal leading-5 text-[#4a5565]">
        {title}
      </p>
      <div className="flex items-center gap-2">
        <p className="text-base font-semibold leading-6 text-black">
          {(() => {
            if (typeof amount === "number") return formatCurrency(amount);
            return String(amount);
          })()}
        </p>
        {chip && (
          <span
            className="inline-flex items-center gap-1 rounded-[30px] px-3 py-0.5 text-xs font-medium whitespace-nowrap"
            style={{ backgroundColor: chip.bgColor || "#ecfcca", color: chip.color || "#016630" }}
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
