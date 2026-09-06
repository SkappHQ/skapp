import { TriggerProps } from "@rootcodelabs/skapp-ui";
import { FC, RefObject } from "react";

export interface ContactTriggerContentProps {
  name?: string;
  companyName?: string | null;
  placeholder?: string;
  triggerProps?: TriggerProps;
}

const ContactTriggerContent: FC<ContactTriggerContentProps> = ({
  name,
  companyName,
  placeholder,
  triggerProps
}) => (
  <button
    type="button"
    className="flex flex-col items-start justify-center w-full min-h-8 cursor-pointer rounded-lg"
    {...triggerProps}
    ref={triggerProps?.ref as RefObject<HTMLButtonElement> | undefined}
  >
    <span
      className={`body2 max-w-full truncate ${name ? "" : "text-secondary-text"}`}
      title={name ?? placeholder}
    >
      {name ?? placeholder}
    </span>
    {companyName && (
      <span
        className="subtitle4 max-w-full truncate text-secondary-text"
        title={companyName}
      >
        {companyName}
      </span>
    )}
  </button>
);

export default ContactTriggerContent;
