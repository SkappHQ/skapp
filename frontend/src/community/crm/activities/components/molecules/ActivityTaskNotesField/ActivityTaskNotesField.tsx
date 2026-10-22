import { TextArea } from "@rootcodelabs/skapp-ui";
import { FC, KeyboardEventHandler } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { validateActivityTaskNotes } from "~community/crm/activities/utils/activityTaskUtil";
import { useInlineEditForm } from "~community/crm/hooks/useInlineEditForm";

interface ActivityTaskNotesFieldProps {
  id: string;
  notes: string;
  isEditable: boolean;
  onSave: (notes: string) => void;
}

const ActivityTaskNotesField: FC<ActivityTaskNotesFieldProps> = ({
  id,
  notes,
  isEditable,
  onSave
}) => {
  const translateText = useTranslator("crmModule");
  const translateAria = useTranslator("crmAria");

  const {
    isEditing,
    value: editedNotes,
    error,
    startEditing,
    changeValue,
    save,
    discard
  } = useInlineEditForm({
    value: notes,
    validate: (value) => validateActivityTaskNotes(value, translateText),
    onSave
  });

  const displayText =
    notes || translateText(["activities", "taskPanel", "noNotes"]);

  const handleDisplayKeyDown: KeyboardEventHandler<HTMLDivElement> = (
    event
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      startEditing();
    }
  };

  const handleTextAreaKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = (
    event
  ) => {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      discard();
    }
  };

  const renderContent = () => {
    if (!isEditable) {
      return (
        <p id={id} className="subtitle3 whitespace-pre-wrap">
          {displayText}
        </p>
      );
    }

    if (isEditing) {
      return (
        <TextArea
          id={`${id}-input`}
          value={editedNotes}
          aria-label={translateAria(["activities", "taskPanel", "notesInput"])}
          placeholder={translateText([
            "activities",
            "taskPanel",
            "notesPlaceholder"
          ])}
          onChange={(event) => changeValue(event.target.value)}
          onKeyDown={handleTextAreaKeyDown}
          onBlur={() => save()}
          className="w-full body2"
          rows={4}
          state={error ? "error" : "default"}
          errorMessage={error}
          autoFocus
        />
      );
    }

    return (
      <div
        id={id}
        role="button"
        tabIndex={0}
        aria-label={translateAria(["activities", "taskPanel", "editNotes"])}
        className={`subtitle3 whitespace-pre-wrap cursor-pointer rounded px-1 py-1 hover:bg-secondary-background ${
          notes ? "" : "text-secondary-icon"
        }`}
        onClick={startEditing}
        onKeyDown={handleDisplayKeyDown}
      >
        {displayText}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-1">
      <p className="subtitle1">
        {translateText(["activities", "taskPanel", "notes"])}
      </p>
      {renderContent()}
    </div>
  );
};

export default ActivityTaskNotesField;
