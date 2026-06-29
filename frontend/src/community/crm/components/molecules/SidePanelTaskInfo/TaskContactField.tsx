import { FC } from "react";

import { CrmContactLookup } from "~community/crm/types/CommonTypes";

interface Props {
  contact: CrmContactLookup | null;
  label: string;
  noneText: string;
}

const TaskContactField: FC<Props> = ({ contact, label, noneText }) => {
  return (
    <div className="flex flex-1 items-center justify-between w-full">
      <span className="subtitle3 text-secondary-text whitespace-nowrap">
        {label}
      </span>
      <div className="flex items-center">
        {contact ? (
          <span className="body2">{contact.name}</span>
        ) : (
          <span className="body2">{noneText}</span>
        )}
      </div>
    </div>
  );
};

export default TaskContactField;
