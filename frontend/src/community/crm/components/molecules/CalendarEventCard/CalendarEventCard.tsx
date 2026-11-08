import { FC, ReactNode } from "react";

interface Props {
  icon: ReactNode;
  title: string;
  details: string[];
}

const CalendarEventCard: FC<Props> = ({ icon, title, details }) => {
  return (
    <div className="flex flex-row items-center gap-4 p-5 rounded-xl border border-secondary-accent">
      <div className="flex shrink-0">{icon}</div>
      <div className="flex flex-col gap-1">
        <span className="text-base font-medium">{title}</span>
        {details.map((detail) => (
          <span
            key={detail}
            className="text-sm text-[var(--color-label-text-slate)]"
          >
            {detail}
          </span>
        ))}
      </div>
    </div>
  );
};

export default CalendarEventCard;
