import { FC, ReactNode } from "react";

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
  return (
    <button
      type="button"
      aria-label={ariaLabel ?? label}
      className={`flex h-21 w-97 items-center gap-8 rounded-lg border border-secondary-accent bg-white px-4 py-2.5 text-left hover:bg-tertiary-background ${className}`}
      onClick={onClick}
    >
      <span className="flex shrink-0 items-center justify-center text-secondary-icon">
        {icon}
      </span>
      <span className="body1 text-black">{label}</span>
    </button>
  );
};

export default ReportCard;
