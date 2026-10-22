import { InputField } from "@rootcodelabs/skapp-ui";
import { FC, KeyboardEventHandler } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { validateActivityTaskName } from "~community/crm/activities/utils/activityTaskUtil";
import { useInlineEditForm } from "~community/crm/hooks/useInlineEditForm";

interface ActivityTaskTitleFieldProps {
  id: string;
  name: string;
  isCompleted: boolean;
  isEditable: boolean;
  onSave: (name: string) => void;
}

const ActivityTaskTitleField: FC<ActivityTaskTitleFieldProps> = ({
  id,
  name,
  isCompleted,
  isEditable,
  onSave
}) => {
  const translateText = useTranslator("crmModule");
  const translateAria = useTranslator("crmAria");

  const {
    isEditing,
    value: editedName,
    error,
    startEditing,
    changeValue,
    save,
    discard
  } = useInlineEditForm({
    value: name,
    validate: (value) => validateActivityTaskName(value, translateText),
    onSave
  });

  const titleClassName = `h1 text-black ${isCompleted ? "line-through" : ""}`;

  const handleInputKeyDown: KeyboardEventHandler<HTMLInputElement> = (
    event
  ) => {
    if (event.key === "Enter") {
      event.preventDefault();
      save();
    } else if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      discard();
    }
  };

  const handleTitleKeyDown: KeyboardEventHandler<HTMLDivElement> = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      startEditing();
    }
  };

  if (!isEditable) {
    return (
      <span id={id} className={titleClassName}>
        {name}
      </span>
    );
  }

  if (isEditing) {
    return (
      <div className="flex-1 min-w-0 p-1">
        <InputField
          id={`${id}-input`}
          value={editedName}
          aria-label={translateAria(["activities", "taskPanel", "nameInput"])}
          onChange={(event) => changeValue(event.target.value)}
          onKeyDown={handleInputKeyDown}
          onBlur={() => save()}
          className="w-full"
          state={error ? "error" : "default"}
          errorMessage={error}
          autoFocus
        />
      </div>
    );
  }

  return (
    <div
      id={id}
      role="button"
      tabIndex={0}
      className={`${titleClassName} min-w-0 truncate cursor-pointer rounded px-1 hover:bg-secondary-background`}
      aria-label={translateAria(["activities", "taskPanel", "editName"])}
      title={name}
      onClick={startEditing}
      onKeyDown={handleTitleKeyDown}
    >
      {name}
    </div>
  );
};

export default ActivityTaskTitleField;
