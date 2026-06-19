import React, { FC, ReactNode } from "react";

interface PriorityLabelItemProps {
  backgroundColor: string;
  icon: ReactNode;
}

const PriorityLabelItem: FC<PriorityLabelItemProps> = ({
  backgroundColor,
  icon
}) => {
  return (
    <span
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${backgroundColor}`}
    >
      {icon}
    </span>
  );
};

export default PriorityLabelItem;
