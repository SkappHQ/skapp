import { DropdownOption } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { CrmContactLookup } from "~community/crm/types/CommonTypes";

export interface ContactOptionItemProps {
  contact: CrmContactLookup;
  option: DropdownOption;
  onSelect: (opt: DropdownOption) => void;
}

const ContactOptionItem: FC<ContactOptionItemProps> = ({
  contact,
  option,
  onSelect
}) => {
  return (
    <button
      type="button"
      className="flex flex-col gap-1 px-4 py-2 text-sm hover:bg-tertiary-background cursor-pointer w-full text-left"
      onClick={() => onSelect(option)}
    >
      <span className="body2">{contact.name}</span>
      {contact.company?.name && (
        <span className="subtitle4 text-secondary-text">
          {contact.company.name}
        </span>
      )}
    </button>
  );
};

export default ContactOptionItem;
