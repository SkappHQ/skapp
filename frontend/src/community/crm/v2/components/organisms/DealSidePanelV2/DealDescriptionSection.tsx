import { ButtonV2, TextArea } from "@rootcodelabs/skapp-ui";
import { FC, KeyboardEventHandler } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import useInlineEditForm from "~community/crm/hooks/useInlineEditForm";
import { validateDealDescription } from "~community/crm/v2/utils/dealValidations";

interface DealDescriptionSectionProps {
  description: string | null;
  onSave: (description: string) => void;
}

const DealDescriptionSection: FC<DealDescriptionSectionProps> = ({
  description,
  onSave
}) => {
  const translateText = useTranslator("crmModule", "deals", "sidePanel");

  const isDescriptionEmpty = !description?.trim();

  const {
    isEditing,
    value: editedDescription,
    error,
    startEditing,
    changeValue,
    save,
    discard
  } = useInlineEditForm({
    value: description ?? "",
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
      <p className="subtitle1">{translateText(["description"])}</p>
      {isEditing ? (
        <div className="flex flex-col gap-3">
          <TextArea
            value={editedDescription}
            onChange={(e) => changeValue(e.target.value)}
            className="w-full body2"
            rows={4}
            state={error ? "error" : "default"}
            errorMessage={error}
            autoFocus
          />
          <div className="flex gap-2 justify-end">
            <ButtonV2
              onClick={discard}
              size="md"
              type="button"
              variant="tertiary"
            >
              {translateText(["buttons", "discard"])}
            </ButtonV2>
            <ButtonV2 onClick={save} size="md" type="button" variant="primary">
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
          onClick={startEditing}
          onKeyDown={handleKeyDown}
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
