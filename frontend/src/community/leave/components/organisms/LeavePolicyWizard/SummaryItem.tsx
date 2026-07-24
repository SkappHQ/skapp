import { FC, ReactNode } from "react";

interface Props {
  label: string;
  value: ReactNode;
}

const SummaryItem: FC<Props> = ({ label, value }) => (
  <div className="flex flex-col gap-1">
    <p className="subtitle4 text-secondary-text">{label}</p>
    {typeof value === "string" ? (
      <p className="body1 text-black">{value || "-"}</p>
    ) : (
      value
    )}
  </div>
);

export default SummaryItem;
