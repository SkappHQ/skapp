import { FC } from "react";

import { CrmOwner } from "~community/crm/types/CommonTypes";

import OwnerAvatarChip from "./OwnerAvatarChip";

interface OwnerOptionItemProps {
  user: CrmOwner;
  onSelect: () => void;
}

const OwnerOptionItem: FC<OwnerOptionItemProps> = ({ user, onSelect }) => (
  <button
    type="button"
    className="flex items-center px-3 py-1.5 cursor-pointer hover:bg-secondary-background w-full text-left"
    onClick={onSelect}
  >
    <OwnerAvatarChip user={user} />
  </button>
);

export default OwnerOptionItem;
