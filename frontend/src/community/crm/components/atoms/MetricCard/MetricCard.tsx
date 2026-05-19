import { FC } from "react";

import styles from "./styles";

interface OverdueBadgeProps {
  count: number;
  label: string;
}

interface Props {
  label: string;
  value: string;
  valueVariant?: "default" | "green" | "blue";
  overdueBadge?: OverdueBadgeProps;
}

const valueVariantMap: Record<"default" | "green" | "blue", string> = {
  default: styles.valueDefault,
  green: styles.valueGreen,
  blue: styles.valueBlue
};

const MetricCard: FC<Props> = ({
  label,
  value,
  valueVariant = "default",
  overdueBadge
}) => {
  const cls = styles;

  return (
    <div className={cls.card}>
      <p className={cls.label}>{label}</p>
      <div className={cls.valueRow}>
        <p className={`${cls.value} ${valueVariantMap[valueVariant]}`}>
          {value}
        </p>
        {overdueBadge && overdueBadge.count > 0 && (
          <span className={cls.badge}>
            {overdueBadge.count} {overdueBadge.label}
          </span>
        )}
      </div>
    </div>
  );
};

export default MetricCard;
