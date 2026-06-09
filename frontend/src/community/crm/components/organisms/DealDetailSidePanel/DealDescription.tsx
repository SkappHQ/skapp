import { ButtonV2, RichTextEditor } from "@rootcodelabs/skapp-ui";
import { FC, useState } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DealDescriptionProps {
  value: string;
  onChange: (value: string) => void;
}

// ---------------------------------------------------------------------------
// DealDescription
// ---------------------------------------------------------------------------

const DealDescription: FC<DealDescriptionProps> = ({ value, onChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const isContentEmpty = (html: string): boolean => {
    if (!html || html.trim() === "") return true;
    return /^(<p><\/p>|<p><br\s*\/?><\/p>)$/.test(html.trim());
  };

  const handleSave = () => {
    onChange(draft);
    setIsEditing(false);
  };

  const handleDiscard = () => {
    setDraft(value);
    setIsEditing(false);
  };

  const handleEditClick = () => {
    setDraft(value);
    setIsEditing(true);
  };

  // Stub upload handlers (no file upload needed for deal descriptions)
  const handleFileUpload = async (): Promise<string> => "";
  const handleImageUpload = async (): Promise<string> => "";

  return (
    <div className="flex flex-col gap-1">
      <span className="subtitle1">Description</span>
      {isEditing ? (
        <div className="flex flex-col gap-2">
          <div className="w-full min-w-0 overflow-hidden body2">
            <RichTextEditor
              editable={true}
              initialContent={draft}
              minHeight="h-40"
              setContent={setDraft}
              showToolbar={false}
              placeholder="Add a description..."
              onFileUpload={handleFileUpload}
              onImageUpload={handleImageUpload}
            />
          </div>
          <div className="flex justify-end gap-2">
            <ButtonV2 onClick={handleDiscard} size="md" variant="tertiary">
              Discard
            </ButtonV2>
            <ButtonV2 onClick={handleSave} size="md" variant="primary">
              Save
            </ButtonV2>
          </div>
        </div>
      ) : (
        <div
          className={`cursor-pointer hover:bg-secondary-background rounded-lg w-full min-w-0 ${
            isContentEmpty(value) ? "" : "tiptap"
          }`}
          onClick={handleEditClick}
        >
          {isContentEmpty(value) ? (
            <span className="text-tertiary-text body2">
              Add a description...
            </span>
          ) : (
            <div
              className="body2 text-black break-words"
              dangerouslySetInnerHTML={{ __html: value }}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default DealDescription;
