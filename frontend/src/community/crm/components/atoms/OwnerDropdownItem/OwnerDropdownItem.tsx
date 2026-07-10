import { FC } from "react";

import OwnerAvatarChip from "~community/crm/components/atoms/OwnerAvatarChip/OwnerAvatarChip";
import { CrmOwner } from "~community/crm/types/CommonTypes";

const OwnerDropdownItem: FC<{ owner: CrmOwner }> = ({ owner }) => (
  <OwnerAvatarChip id={String(owner.employeeId)} owner={owner} />
);

export default OwnerDropdownItem;
