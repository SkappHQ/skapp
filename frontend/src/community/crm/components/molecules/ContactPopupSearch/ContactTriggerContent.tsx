import { FC } from "react";

import { CrmContactLookup } from "~community/crm/types/CommonTypes";

export interface ContactTriggerContentProps {
  contact?: CrmContactLookup;
  onSelect?: () => void;
  placeholder?: string;
}

const ContactTriggerContent: FC<ContactTriggerContentProps> = ({
  contact,
  onSelect,
  placeholder
}) => {
  return (
    <button
      type="button"
      className="flex flex-col items-start justify-center w-full min-h-8 cursor-pointer rounded-lg"
      onClick={onSelect}
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
