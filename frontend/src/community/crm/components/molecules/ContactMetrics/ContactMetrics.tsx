import { Skeleton } from "@mui/material";
import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import MetricCard from "~community/crm/components/atoms/MetricCard/MetricCard";
import { CrmContactMetricsType } from "~community/crm/types/CommonTypes";
import { formatCurrency } from "~community/crm/utils/contactMetricsUtils";

import styles from "./styles";

interface Props {
  metrics: CrmContactMetricsType;
}

const ContactMetrics: FC<Props> = ({ metrics }) => {
  const translateText = useTranslator(
    "crmModule",
    "contacts",
    "contactDetailsPanel"
  );

  return (
    <div className={styles.grid}>
      <MetricCard
        label={translateText(["metrics", "openTasks"])}
        value={String(metrics.openTasksCount)}
        overdueBadge={
          metrics.overdueTasksCount > 0
            ? {
                count: metrics.overdueTasksCount,
                label: translateText(["metrics", "overdueTasks"])
              }
            : undefined
        }
      />

      <MetricCard
        label={translateText(["metrics", "activeDeals"])}
        value={String(metrics.activeDealsCount)}
      />
      <MetricCard
        label={translateText(["metrics", "totalRevenue"])}
        value={formatCurrency(metrics.totalRevenue)}
        valueVariant="green"
      />

      <MetricCard
        label={translateText(["metrics", "revenueOnPipeline"])}
        value={formatCurrency(metrics.revenueOnPipeline)}
        valueVariant="blue"
      />
    </div>
  );
};

export const ContactMetricsSkeleton: FC = () => (
  <div className={styles.grid}>
    {[0, 1, 2, 3].map((i) => (
      <div key={i} className="flex-1">
        <Skeleton variant="rounded" height={64} animation="wave" />
      </div>
    ))}
  </div>
);

export default ContactMetrics;
