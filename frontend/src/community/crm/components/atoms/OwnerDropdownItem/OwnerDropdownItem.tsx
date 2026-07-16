import { FC } from "react";

import OwnerAvatarChip from "~community/crm/components/atoms/OwnerAvatarChip/OwnerAvatarChip";
import { CrmOwner } from "~community/crm/types/CommonTypes";

interface OwnerDropdownItemProps {
  owner: CrmOwner;
}

const OwnerDropdownItem: FC<OwnerDropdownItemProps> = ({ owner }) => (
  <OwnerAvatarChip id={String(owner.employeeId)} owner={owner} />
);

export default OwnerDropdownItem;
