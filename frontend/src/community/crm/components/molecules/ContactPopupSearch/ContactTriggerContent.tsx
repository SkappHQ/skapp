import { TriggerProps } from "@rootcodelabs/skapp-ui";
import { FC, RefObject } from "react";

import { CrmContactLookup } from "~community/crm/types/CommonTypes";

export interface ContactTriggerContentProps {
  contact?: CrmContactLookup;
  placeholder?: string;
  triggerProps?: TriggerProps;
}

const ContactTriggerContent: FC<ContactTriggerContentProps> = ({
  contact,
  placeholder,
  triggerProps
}) => {
  return (
    <button
      type="button"
      className="flex flex-col items-start justify-center w-full min-h-8 cursor-pointer rounded-lg"
      {...triggerProps}
      ref={triggerProps?.ref as RefObject<HTMLButtonElement> | undefined}
    >
      <span className={`body2 ${contact?.name ? "" : "text-secondary-text"}`}>
        {contact?.name ?? placeholder}
      </span>
      {contact?.company?.name && (
        <span className="subtitle4 text-secondary-text">
          {contact.company.name}
        </span>
      )}
    </button>
  );
};

export default ContactTriggerContent;
