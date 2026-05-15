import { Stack } from "@mui/material";
import { FC, JSX } from "react";

import CompanyMetricCard from "~community/crm/components/atoms/CompanyMetricCard/CompanyMetricCard";

interface MetricItem {
  title: string;
  amount: string;
  chip?: JSX.Element;
}

interface Props {
  metrics: MetricItem[];
}

const CompanyMetricCards: FC<Props> = ({ metrics }) => {
  return (
    <Stack direction="row" gap="1rem" sx={{ marginTop: "1.5rem", "& > *": { flex: 1 } }}>
      {metrics.map((metric, index) => (
        <CompanyMetricCard
          key={index}
          title={metric.title}
          amount={metric.amount}
          chip={metric.chip}
        />
      ))}
    </Stack>
  );
};

export default CompanyMetricCards;