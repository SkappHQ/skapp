import { Card } from "@rootcodelabs/skapp-ui";
import { FC, KeyboardEvent, ReactNode } from "react";

interface Props {
  icon: ReactNode;
  title: string;
  description: string;
  onSelect: () => void;
}

const PolicyTypeCard: FC<Props> = ({
  icon,
  title,
  description,
  onSelect
}) => (
  <Card
    role="button"
    aria-label={title}
    onClick={onSelect}
    onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onSelect();
      }
    }}
    className="flex-1 cursor-pointer rounded-xl aspect-133.75/109.5 bg-white hover:shadow-md hover:outline-primary-accent"
  >
    <div className="flex h-full flex-col items-center justify-center gap-8 text-center">
      <span className="text-primary-accent" aria-hidden="true">
        {icon}
      </span>
      <span className="flex flex-col gap-4">
        <span className="subtitle2 text-black">{title}</span>
        <span className="body2 text-secondary-text">{description}</span>
      </span>
    </div>
  </Card>
);

export default PolicyTypeCard;
