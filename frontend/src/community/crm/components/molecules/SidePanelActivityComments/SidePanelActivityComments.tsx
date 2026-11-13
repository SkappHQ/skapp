import { ButtonV2, TextArea } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { useInlineEditForm } from "~community/crm/hooks/useInlineEditForm";

interface Props {
  id: string;
  comments?: string;
  onSave: (comments: string) => void;
  title?: string;
  emptyText?: string;
  ariaLabel?: string;
  editAriaLabel?: string;
}

const SidePanelActivityComments: FC<Props> = ({
  id,
  comments,
  onSave,
  title,
  emptyText,
  ariaLabel,
  editAriaLabel
}) => {
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

  const emptyLabel = emptyText || translateText(["noComments"]);

  return (
    <div className="flex flex-col gap-1">
      <p className="subtitle1">{title || translateText(["comments"])}</p>
      {isEditing ? (
        <div className="flex flex-col gap-3">
          <TextArea
            id={`${id}-comments-input`}
            value={editedComments}
            onChange={(e) => changeValue(e.target.value)}
            className="w-full body2"
            rows={4}
            aria-label={ariaLabel || translateAria(["comments"])}
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
            <ButtonV2
              onClick={() => void save()}
              size="md"
              type="button"
              variant="primary"
            >
              {translateText(["buttons", "save"])}
            </ButtonV2>
          </div>
        </div>
      ) : (
        <button
          id={`${id}-comments`}
          type="button"
          className="subtitle3 max-h-24 overflow-y-auto break-words cursor-pointer hover:bg-secondary-background rounded text-left w-full bg-transparent border-none"
          aria-label={editAriaLabel || translateAria(["editComments"])}
          onClick={startEditing}
        >
          {comments || emptyLabel}
        </button>
      )}
    </div>
  );
};

export default SidePanelActivityComments;
