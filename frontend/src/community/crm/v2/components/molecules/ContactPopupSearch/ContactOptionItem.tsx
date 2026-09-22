import { DropdownOption } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { CrmContactEntity } from "~community/crm/v2/types/CrmCommonTypes";
import { getContactDisplayName } from "~community/crm/v2/utils/contactUtil";

export interface ContactOptionItemProps {
  contact: CrmContactEntity;
  companyName?: string;
  option: DropdownOption;
  onSelect: (opt: DropdownOption) => void;
}

const ContactOptionItem: FC<ContactOptionItemProps> = ({
  contact,
  companyName,
  option,
  onSelect
}) => {
  const contactName = getContactDisplayName(contact);

  return (
    <button
      type="button"
      className="flex flex-col gap-1 px-4 py-2 body2 hover:bg-tertiary-background cursor-pointer w-full text-left"
      onClick={() => onSelect(option)}
    >
      <span className="body2 w-full truncate" title={contactName}>
        {contactName}
      </span>
      {companyName && (
        <span
          className="subtitle4 w-full truncate text-secondary-text"
          title={companyName}
        >
          {companyName}
        </span>
      )}
    </button>
  );
};

export default ContactOptionItem;
