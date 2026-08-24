import { Card, RadioButton } from "@rootcodelabs/skapp-ui";
import { FC, KeyboardEvent } from "react";

interface Props {
  title: string;
  description: string;
  isSelected: boolean;
  isError: boolean;
  index: number;
  describedBy?: string;
  onSelect: () => void;
  onNavigate: (fromIndex: number, direction: number) => void;
}

const DurationOptionCard: FC<Props> = ({
  title,
  description,
  isSelected,
  isError,
  index,
  describedBy,
  onSelect,
  onNavigate
}) => {
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect();
      return;
    }

    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      event.preventDefault();
      onNavigate(index, 1);
      return;
    }

    if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      event.preventDefault();
      onNavigate(index, -1);
    }
  };

  return (
    <Card
      isSelected={isSelected}
      className={`inline-flex cursor-pointer flex-col items-start justify-start ${
        isError ? "ring-1 ring-semantic-red-accent" : ""
      }`}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      role="checkbox"
      tabIndex={0}
      aria-checked={isSelected}
      aria-label={title}
      aria-describedby={describedBy}
    >
      <div className="inline-flex w-full items-center justify-start gap-4">
        <RadioButton isSelected={isSelected} />
        <div className="inline-flex flex-1 flex-col items-start justify-start">
          <div className="subtitle2 leading-tight text-black">{title}</div>
          <div className="body1 w-full text-black">{description}</div>
        </div>
      </div>
    </Card>
  );
};

export default DurationOptionCard;
