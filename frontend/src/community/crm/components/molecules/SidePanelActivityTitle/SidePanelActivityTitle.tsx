import {
  CloseIcon,
  IconButton,
  InputField,
  TickIcon
} from "@rootcodelabs/skapp-ui";
import { FC, KeyboardEventHandler } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { validateActivityTitle } from "~community/crm/activities/utils/activityValidations";
import { useInlineEditForm } from "~community/crm/hooks/useInlineEditForm";

interface Props {
  id: string;
  title: string;
  onSave: (title: string) => void;
}

const SidePanelActivityTitle: FC<Props> = ({ id, title, onSave }) => {
  const translateText = useTranslator("crmModule");
  const translateAria = useTranslator(
    "crmAria",
    "activities",
    "activitySidePanel"
  );

  const {
    isEditing,
    value: editedTitle,
    error,
    startEditing,
    changeValue,
    save,
    discard
  } = useInlineEditForm({
    value: title,
    validate: (value) => validateActivityTitle(value, translateText),
    onSave
  });

  const handleInputKeyDown: KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      void save();
    }
    if (e.key === "Escape") {
      e.preventDefault();
      discard();
    }
  };

  if (isEditing) {
    return (
      <div className="flex flex-1 gap-2 items-center min-w-0">
        <div className="flex-1 min-w-0 p-1">
          <InputField
            id={`${id}-title-input`}
            value={editedTitle}
            onChange={(e) => changeValue(e.target.value)}
            onKeyDown={handleInputKeyDown}
            className="w-full"
            state={error ? "error" : "default"}
            errorMessage={error}
            aria-label={translateAria(["title"])}
            autoFocus
          />
        </div>
        <IconButton
          aria-label={translateAria(["saveTitle"])}
          isRounded
          icon={<TickIcon fill="var(--color-primary-accent)" />}
          onClick={() => void save()}
          variant="outlined"
        />
        <IconButton
          aria-label={translateAria(["discardTitle"])}
          isRounded
          icon={<CloseIcon />}
          onClick={discard}
        />
      </div>
    );
  }

  return (
    <button
      id={`${id}-title`}
      type="button"
      className="h2 text-black text-left flex-1 min-w-0 cursor-pointer hover:bg-secondary-background py-1 rounded bg-transparent border-none"
      aria-label={translateAria(["editTitle"])}
      onClick={startEditing}
    >
      {title}
    </button>
  );
};

export default SidePanelActivityTitle;
