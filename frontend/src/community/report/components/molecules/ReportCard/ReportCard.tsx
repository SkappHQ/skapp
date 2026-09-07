import { Card } from "@rootcodelabs/skapp-ui";
import { FC, KeyboardEvent, ReactNode } from "react";

import { shouldActivateButton } from "~community/common/utils/keyboardUtils";

export interface ReportCardProps {
  icon: ReactNode;
  label: string;
  ariaLabel?: string;
  className?: string;
  onClick?: () => void;
}

const ReportCard: FC<ReportCardProps> = ({
  icon,
  label,
  ariaLabel,
  className = "",
  onClick
}) => {
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (shouldActivateButton(event.key)) {
      event.preventDefault();
      onClick?.();
    }
  };

  return (
    <Card
      role="button"
      aria-label={ariaLabel ?? label}
      className={`flex h-21 w-97 items-center gap-8 hover:bg-tertiary-background ${className}`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
    >
      <span className="flex shrink-0 items-center justify-center text-secondary-icon">
        {icon}
      </span>
      <span className="body1 text-black">{label}</span>
    </Card>
  );
};

export default ReportCard;
