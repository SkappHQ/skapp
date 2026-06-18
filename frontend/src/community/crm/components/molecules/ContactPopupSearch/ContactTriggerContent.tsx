import { ButtonHTMLAttributes, FC, RefObject } from "react";

import { CrmContactLookup } from "~community/crm/types/CommonTypes";

export interface ContactTriggerContentProps {
  contact?: CrmContactLookup;
  onSelect?: () => void;
  placeholder?: string;
  triggerRef?: RefObject<HTMLButtonElement>;
  triggerProps?: ButtonHTMLAttributes<HTMLButtonElement>;
}

const ContactTriggerContent: FC<ContactTriggerContentProps> = ({
  contact,
  onSelect,
  placeholder,
  triggerRef,
  triggerProps
}) => {
  return (
    <button
      {...triggerProps}
      ref={triggerRef}
      type="button"
      className="flex flex-col items-start justify-center w-full min-h-8 cursor-pointer rounded-lg"
      onClick={(event) => {
        if (onSelect) {
          onSelect();
          return;
        }
        triggerProps?.onClick?.(event);
      }}
    >
      <span className="body2">{contact?.name ?? placeholder}</span>
      {contact?.company?.name && (
        <span className="subtitle4 text-secondary-text">
          {contact.company.name}
        </span>
      )}
    </button>
  );
};

export default ContactTriggerContent;
