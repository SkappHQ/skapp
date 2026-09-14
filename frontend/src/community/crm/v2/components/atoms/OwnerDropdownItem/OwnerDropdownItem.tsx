import { FC } from "react";

import OwnerAvatarChip from "~community/crm/v2/components/atoms/OwnerAvatarChip/OwnerAvatarChip";
import { CrmOwnerEntity } from "~community/crm/v2/types/CrmCommonTypes";

interface OwnerDropdownItemProps {
  owner: CrmOwnerEntity;
}

const OwnerDropdownItem: FC<OwnerDropdownItemProps> = ({ owner }) => (
  <OwnerAvatarChip id={String(owner.employeeId)} owner={owner} />
);

export default OwnerDropdownItem;
