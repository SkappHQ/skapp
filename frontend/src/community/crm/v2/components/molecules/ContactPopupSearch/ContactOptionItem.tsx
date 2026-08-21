import { DropdownOption } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { CrmContactLookupItem } from "~community/crm/v2/types/CrmTypes";

export interface ContactOptionItemProps {
  contact: CrmContactLookupItem;
  option: DropdownOption;
  onSelect: (opt: DropdownOption) => void;
}

const ContactOptionItem: FC<ContactOptionItemProps> = ({
  contact,
  option,
  onSelect
}) => (
  <button
    type="button"
    className="flex flex-col gap-1 px-4 py-2 body2 hover:bg-tertiary-background cursor-pointer w-full text-left"
    onClick={() => onSelect(option)}
  >
    <span className="body2 w-full truncate" title={contact.name}>
      {contact.name}
    </span>
    {contact.company?.name && (
      <span
        className="subtitle4 w-full truncate text-secondary-text"
        title={contact.company?.name}
      >
        {contact.company?.name}
      </span>
    )}
  </button>
);

export default ContactOptionItem;
