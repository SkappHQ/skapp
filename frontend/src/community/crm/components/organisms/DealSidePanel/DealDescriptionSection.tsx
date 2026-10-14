import { ButtonV2, TextArea } from "@rootcodelabs/skapp-ui";
import { FC, KeyboardEventHandler } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { useInlineEditForm } from "~community/crm/hooks/useInlineEditForm";
import { validateDealDescription } from "~community/crm/utils/dealValidations";

interface DealDescriptionSectionProps {
  description?: string;
  onSave: (description: string) => void;
}

const DealDescriptionSection: FC<DealDescriptionSectionProps> = ({
  description,
  onSave
}) => {
  const translateText = useTranslator("crmModule");
  const translateAria = useTranslator("crmAria");

  const {
    isEditing,
    value: editedDescription,
    error,
    startEditing,
    changeValue,
    save,
    discard
  } = useInlineEditForm({
    value: description || "",
    validate: (value) => validateDealDescription(value, translateText),
    onSave
  });

  const handleKeyDown: KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      startEditing();
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <p className="subtitle1">
        {translateText(["deals", "common", "labels", "description"])}
      </p>
      {isEditing ? (
        <div className="flex flex-col gap-3">
          <TextArea
            value={editedDescription}
            onChange={(e) => changeValue(e.target.value)}
            className="body2 w-full"
            rows={4}
            state={error ? "error" : "default"}
            errorMessage={error}
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <ButtonV2
              onClick={discard}
              size="md"
              type="button"
              variant="tertiary"
            >
              {translateText(["deals", "sidePanel", "buttons", "discard"])}
            </ButtonV2>
            <ButtonV2 onClick={save} size="md" type="button" variant="primary">
              {translateText(["deals", "sidePanel", "buttons", "save"])}
            </ButtonV2>
          </div>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          className="body2 w-full cursor-pointer rounded border-none bg-transparent text-left hover:bg-secondary-background"
          aria-label={translateAria(["deals", "sidePanel", "editDescription"])}
          onClick={startEditing}
          onKeyDown={handleKeyDown}
        >
          {!description ? (
            <span className="body2 text-secondary-text">
              {translateText([
                "deals",
                "sidePanel",
                "placeholders",
                "description"
              ])}
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
