import { TriggerProps } from "@rootcodelabs/skapp-ui";
import { FC, RefObject } from "react";

export interface ContactTriggerContentProps {
  name?: string;
  companyName?: string;
  placeholder?: string;
  triggerProps?: TriggerProps;
}

const ContactTriggerContent: FC<ContactTriggerContentProps> = ({
  name,
  companyName,
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
      <span className={`body2 ${name ? "" : "text-secondary-text"}`}>
        {name ?? placeholder}
      </span>
      {companyName && (
        <span className="subtitle4 text-secondary-text">{companyName}</span>
      )}
    </button>
  );
};

export default ContactTriggerContent;
