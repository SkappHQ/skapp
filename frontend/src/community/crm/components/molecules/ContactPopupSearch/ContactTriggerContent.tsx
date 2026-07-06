import { TriggerProps } from "@rootcodelabs/skapp-ui";
import { FC, RefObject } from "react";

import { CrmContactLookup } from "~community/crm/types/CommonTypes";

export interface ContactTriggerContentProps {
  contact?: CrmContactLookup;
  onSelect?: () => void;
  placeholder?: string;
  triggerProps?: Omit<TriggerProps, "onClick">;
}

const ContactTriggerContent: FC<ContactTriggerContentProps> = ({
  contact,
  onSelect,
  placeholder,
  triggerProps
}) => {
  const { ref, ...triggerAriaProps } = triggerProps ?? {};

  return (
    <button
      type="button"
      ref={ref as RefObject<HTMLButtonElement> | undefined}
      className="flex flex-col items-start justify-center w-full min-h-8 cursor-pointer rounded-lg"
      onClick={onSelect}
      {...triggerAriaProps}
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
