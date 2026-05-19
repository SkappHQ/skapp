import { ButtonV2, EditIcon, TrashIcon } from "@rootcodelabs/skapp-ui";
import { FC, KeyboardEvent, useEffect, useRef, useState } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { IconName } from "~community/common/types/IconTypes";

import styles from "./styles";

interface Props {
  editLabel: string;
  deleteLabel: string;
  onEdit: () => void;
  onDelete: () => void;
}

const ContactActionMenu: FC<Props> = ({
  editLabel,
  deleteLabel,
  onEdit,
  onDelete
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const cls = styles;

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") setIsOpen(false);
  };

  const handleEdit = () => {
    setIsOpen(false);
    onEdit();
  };

  const handleDelete = () => {
    setIsOpen(false);
    onDelete();
  };

  return (
    <div ref={wrapperRef} className={cls.wrapper} onKeyDown={handleKeyDown}>
      <ButtonV2
        type="button"
        variant="tertiary"
        size="sm"
        className={cls.trigger}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Contact options"
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <Icon
          name={IconName.THREE_DOTS_ICON}
          fill={cls.triggerIconFill}
          width="16"
          height="16"
        />
      </ButtonV2>

      {isOpen && (
        <div role="menu" className={cls.dropdown}>
          <ButtonV2
            type="button"
            variant="line"
            size="sm"
            isFullWidth
            iconPosition="start"
            icon={<EditIcon color={cls.editIconFill} />}
            role="menuitem"
            className={cls.editItem}
            onClick={handleEdit}
          >
            {editLabel}
          </ButtonV2>

          <ButtonV2
            type="button"
            variant="error"
            size="sm"
            isFullWidth
            iconPosition="start"
            icon={<TrashIcon />}
            role="menuitem"
            className={cls.deleteItem}
            onClick={handleDelete}
          >
            {deleteLabel}
          </ButtonV2>
        </div>
      )}
    </div>
  );
};

export default ContactActionMenu;
