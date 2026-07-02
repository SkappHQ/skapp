import { ButtonV2, TextArea } from "@rootcodelabs/skapp-ui";
import { FC, useState } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";

interface DealDescriptionSectionProps {
  description: string | null;
}

const DealDescriptionSection: FC<DealDescriptionSectionProps> = ({
  description
}) => {
  const translateText = useTranslator("crmModule", "deals", "sidePanel");

  const isDescriptionEmpty = !description?.trim();

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedDescription, setEditedDescription] = useState<string>("");

  const handleClick = () => {
    setIsEditing(true);
    setEditedDescription(description ?? "");
  };

  const handleSave = () => {
    // Edit API call
    setIsEditing(false);
  };

  const handleDiscard = () => {
    setEditedDescription(description ?? "");
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col gap-1">
      <p className="subtitle1">{translateText(["description"])}</p>
      {isEditing ? (
        <div className="flex flex-col gap-3">
          <TextArea
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
            className="w-full body2"
            rows={4}
            autoFocus
          />
          <div className="flex gap-2 justify-end">
            <ButtonV2
              onClick={handleDiscard}
              size="md"
              type="button"
              variant="tertiary"
            >
              {translateText(["buttons", "discard"])}
            </ButtonV2>
            <ButtonV2
              onClick={handleSave}
              size="md"
              type="button"
              variant="primary"
            >
              {translateText(["buttons", "save"])}
            </ButtonV2>
          </div>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          className="body2 text-left w-full cursor-pointer hover:bg-secondary-background rounded bg-transparent border-none"
          aria-label={translateText(["ariaLabels", "editDescription"])}
          onClick={handleClick}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleClick();
            }
          }}
        >
          {isDescriptionEmpty ? (
            <span className="text-secondary-text body2">
              {translateText(["placeholders", "description"])}
            </span>
          ) : (
            description
          )}
        </div>
      )}
    </div>
  );
};

export default DealDescriptionSection;
