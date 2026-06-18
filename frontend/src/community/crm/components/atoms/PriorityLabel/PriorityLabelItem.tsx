import { Label } from "@rootcodelabs/skapp-ui";
import React, { FC, ReactNode } from "react";

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
    <Label backgroundColor={backgroundColor} className="py-2 px-3">
      {icon}
      <span className={`body3 ${textClassName}`}>{label}</span>
    </Label>
  );
};

export default PriorityLabelItem;
