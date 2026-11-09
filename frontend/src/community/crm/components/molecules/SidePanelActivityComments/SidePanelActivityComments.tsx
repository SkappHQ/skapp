import { ButtonV2, TextArea } from "@rootcodelabs/skapp-ui";
import { FC, KeyboardEventHandler } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { useInlineEditForm } from "~community/crm/hooks/useInlineEditForm";

interface Props {
  id: string;
  comments?: string;
  onSave: (comments: string) => void;
}

const SidePanelActivityComments: FC<Props> = ({ id, comments, onSave }) => {
  const translateText = useTranslator(
    "crmModule",
    "activities",
    "activitySidePanel"
  );
  const translateAria = useTranslator(
    "crmAria",
    "activities",
    "activitySidePanel"
  );

  const {
    isEditing,
    value: editedComments,
    startEditing,
    changeValue,
    save,
    discard
  } = useInlineEditForm({
    value: comments ?? "",
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
      <p className="subtitle1">{translateText(["comments"])}</p>
      {isEditing ? (
        <div className="flex flex-col gap-3">
          <TextArea
            id={`${id}-comments-input`}
            value={editedComments}
            onChange={(e) => changeValue(e.target.value)}
            className="w-full body2"
            rows={4}
            aria-label={translateAria(["comments"])}
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
          id={`${id}-comments`}
          role="button"
          tabIndex={0}
          className="subtitle3 max-h-24 overflow-y-auto break-words cursor-pointer hover:bg-secondary-background rounded"
          aria-label={translateAria(["editComments"])}
          onClick={startEditing}
          onKeyDown={handleKeyDown}
        >
          {comments || translateText(["noComments"])}
        </div>
      )}
    </div>
  );
};

export default SidePanelActivityComments;
