import { FC, KeyboardEvent, ReactNode, useEffect, useRef } from "react";

interface EditableCellProps {
  isEditing: boolean;
  display: ReactNode;
  children: ReactNode;
  ariaLabel?: string;
  onStartEditing: () => void;
  onClickOutside: () => void;
}

const EditableCell: FC<EditableCellProps> = ({
  isEditing,
  display,
  children,
  ariaLabel,
  onStartEditing,
  onClickOutside
}) => {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isEditing) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        editorRef.current &&
        !editorRef.current.contains(event.target as Node)
      ) {
        onClickOutside();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isEditing, onClickOutside]);

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onStartEditing();
    }
  };

  if (isEditing) {
    return (
      <div ref={editorRef} className="w-full min-w-0">
        {children}
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      className="w-full min-w-0 min-h-[32px] rounded-lg flex items-center cursor-pointer hover:bg-secondary-background transition-colors"
      aria-label={ariaLabel}
      onClick={onStartEditing}
      onKeyDown={handleKeyDown}
    >
      {display}
    </div>
  );
};

export default EditableCell;
