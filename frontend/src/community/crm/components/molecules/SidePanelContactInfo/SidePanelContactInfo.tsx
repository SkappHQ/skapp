import {
  BuildingIcon,
  EmailOutlineIcon,
  PhoneIcon
} from "@rootcodelabs/skapp-ui";
import { FC } from "react";
import { useShallow } from "zustand/react/shallow";

import SidePanelHeaderInfoItem from "~community/crm/components/molecules/SidePanelHeaderInfoItem/SidePanelHeaderInfoItem";
import { useCrmStore } from "~community/crm/store/store";
import { CrmContactEntity } from "~community/crm/types/CrmCommonTypes";
import { formatTableValue } from "~community/crm/utils/commonUtil";

interface SidePanelContactInfoProps {
  contact: CrmContactEntity;
}

const SidePanelContactInfo: FC<SidePanelContactInfoProps> = ({ contact }) => {
  const { companies } = useCrmStore(
    useShallow((state) => ({ companies: state.companies }))
  );

  const companyName = contact.companyId && companies[contact.companyId]?.name;

  return (
    <div className="flex items-center justify-between max-w-[629px] w-full">
      <SidePanelHeaderInfoItem
        icon={
          <EmailOutlineIcon style={{ color: "var(--color-secondary-icon)" }} />
        }
        value={formatTableValue(contact.email)}
      />

      <SidePanelHeaderInfoItem
        icon={<PhoneIcon style={{ color: "var(--color-secondary-icon)" }} />}
        value={formatTableValue(contact.contactNumber)}
      />

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
