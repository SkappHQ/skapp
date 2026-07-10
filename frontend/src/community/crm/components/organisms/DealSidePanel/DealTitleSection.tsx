import {
  CloseIcon,
  IconButton,
  InputField,
  TickIcon
} from "@rootcodelabs/skapp-ui";
import { FC, KeyboardEventHandler } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import useInlineEditForm from "~community/crm/hooks/useInlineEditForm";
import { validateDealName } from "~community/crm/utils/dealValidations";

interface DealTitleSectionProps {
  name: string;
  onSave: (name: string) => void;
}

const DealTitleSection: FC<DealTitleSectionProps> = ({ name, onSave }) => {
  const translateText = useTranslator("crmModule", "deals", "sidePanel");

  const {
    isEditing,
    value: editedTitle,
    error,
    startEditing,
    changeValue,
    save,
    discard
  } = useInlineEditForm({
    value: name,
    validate: (value) => validateDealName(value, translateText),
    onSave
  });

  const handleInputKeyDown: KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      save();
    }
  };

  const handleTitleKeyDown: KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      startEditing();
    }
  };

  if (isEditing) {
    return (
      <div className="flex gap-6 items-center min-w-0">
        <div className="flex-1 min-w-0 p-1">
          <InputField
            value={editedTitle}
            onChange={(e) => changeValue(e.target.value)}
            onKeyDown={handleInputKeyDown}
            className="w-full"
            state={error ? "error" : "default"}
            errorMessage={error}
            autoFocus
          />
        </div>
        <div className="w-1/3 shrink-0 flex justify-start items-center">
          <div className="flex gap-2">
            <IconButton
              aria-label={translateText(["ariaLabels", "saveTitle"])}
              isRounded={true}
              icon={<TickIcon fill="var(--color-primary-accent)" />}
              onClick={save}
              variant="outlined"
            />
            <IconButton
              aria-label={translateText(["ariaLabels", "discardTitle"])}
              isRounded={true}
              icon={<CloseIcon />}
              onClick={discard}
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
          onClick={startEditing}
          onKeyDown={handleTitleKeyDown}
        >
          {name}
        </div>
      </div>
    </div>
  );
};

export default DealTitleSection;
