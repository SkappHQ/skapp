import {
  BuildingIcon,
  EmailOutlineIcon,
  PhoneIcon
} from "@rootcodelabs/skapp-ui";
import { FC } from "react";
import { useShallow } from "zustand/react/shallow";

import SidePanelHeaderInfoItem from "~community/crm/v2/components/molecules/SidePanelHeaderInfoItem/SidePanelHeaderInfoItem";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { CrmContactEntity } from "~community/crm/v2/types/CrmCommonTypes";

interface SidePanelContactInfoProps {
  contact: CrmContactEntity;
}

const SidePanelContactInfo: FC<SidePanelContactInfoProps> = ({ contact }) => {
  const { companies } = useCrmStoreV2(
    useShallow((state) => ({ companies: state.companies }))
  );

  const companyName = contact.companyId && companies[contact.companyId]?.name;

  return (
    <div className="flex items-center justify-between max-w-[629px] w-full">
      {contact.email && (
        <SidePanelHeaderInfoItem
          icon={
            <EmailOutlineIcon
              style={{ color: "var(--color-secondary-icon)" }}
            />
          }
          value={contact.email}
        />
      )}

      {contact.contactNumber && (
        <SidePanelHeaderInfoItem
          icon={<PhoneIcon style={{ color: "var(--color-secondary-icon)" }} />}
          value={contact.contactNumber}
        />
      )}

      {companyName && (
        <SidePanelHeaderInfoItem
          icon={
            <BuildingIcon style={{ color: "var(--color-secondary-icon)" }} />
          }
          value={companyName}
        />
      )}
    </div>
  );
};

export default SidePanelContactInfo;
