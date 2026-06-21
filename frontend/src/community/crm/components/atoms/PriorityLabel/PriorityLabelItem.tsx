import { FC, ReactNode } from "react";

interface PriorityLabelItemProps {
  backgroundColor: string;
  icon: ReactNode;
  textClassName: string;
  label: string;
}

const PriorityLabelItem: FC<PriorityLabelItemProps> = ({
  backgroundColor,
  icon,
  textClassName,
  label
}) => {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 ${backgroundColor}`}
    >
      {icon}
      <span className={`body3 font-medium ${textClassName}`}>{label}</span>
    </span>
  );
};

export default PriorityLabelItem;
