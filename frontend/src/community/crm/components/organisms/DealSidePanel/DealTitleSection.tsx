import {
  CloseIcon,
  IconButton,
  InputField,
  TickIcon
} from "@rootcodelabs/skapp-ui";
import { FC, KeyboardEventHandler, useState } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";

interface DealTitleSectionProps {
  name: string;
}

const DealTitleSection: FC<DealTitleSectionProps> = ({ name }) => {
  const translateText = useTranslator("crmModule", "deals", "sidePanel");

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedTitle, setEditedTitle] = useState<string>("");

  const handleClick = () => {
    setIsEditing(true);
    setEditedTitle(name);
  };

  const handleSave = () => {
    // Edit API call
    setIsEditing(false);
  };

  const handleDiscard = () => {
    setEditedTitle(name);
    setIsEditing(false);
  };

  const handleInputKeyDown: KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    }
  };

  const handleTitleKeyDown: KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  if (isEditing) {
    return (
      <div className="flex gap-6 items-center min-w-0">
        <div className="flex-1 min-w-0 p-1">
          <InputField
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            onKeyDown={handleInputKeyDown}
            className="w-full"
            autoFocus
          />
        </div>
        <div className="w-1/3 shrink-0 flex justify-start items-center">
          <div className="flex gap-2">
            <IconButton
              aria-label={translateText(["ariaLabels", "saveTitle"])}
              isRounded={true}
              icon={<TickIcon fill="var(--color-primary-accent)" />}
              onClick={handleSave}
              variant="outlined"
            />
            <IconButton
              aria-label={translateText(["ariaLabels", "discardTitle"])}
              isRounded={true}
              icon={<CloseIcon />}
              onClick={handleDiscard}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-6 items-center min-w-0">
      <div className="flex-1 min-w-0">
        <div
          role="button"
          tabIndex={0}
          className="h2 text-left w-full cursor-pointer hover:bg-secondary-background py-1 rounded bg-transparent border-none"
          aria-label={translateText(["ariaLabels", "editTitle"])}
          onClick={handleClick}
          onKeyDown={handleTitleKeyDown}
        >
          {name}
        </div>
      </div>
    </div>
  );
};

export default DealTitleSection;
