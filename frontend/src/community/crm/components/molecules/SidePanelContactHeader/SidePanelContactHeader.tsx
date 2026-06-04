import { BuildingIcon } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { IconName } from "~community/common/types/IconTypes";
import SidePanelHeaderInfoItem from "~community/crm/components/atoms/SidePanelContactInfoItem/SidePanelHeaderInfoItem";
import { CrmContactType } from "~community/crm/types/CommonTypes";

interface Props {
  contact?: CrmContactType;
  companyHref?: string;
}

const SidePanelContactHeader: FC<Props> = ({ contact, companyHref }) => {
  if (!contact) return null;

  const company = contact.company;

  return (
    <div className="flex items-center justify-between max-w-[629px] w-full">
      <SidePanelHeaderInfoItem
        icon={IconName.EMAIL_ICON}
        value={contact.email}
      />

      <SidePanelHeaderInfoItem
        icon={IconName.LOCAL_PHONE_ICON}
        value={contact.contactNumber}
      />

      {company && (
        <SidePanelHeaderInfoItem
          icon={<BuildingIcon stroke="var(--color-secondary-icon)" />}
          value={company.name}
          href={companyHref}
          endIcon={IconName.POP_OUT_ICON}
        />
      )}
    </div>
  );
};

export default SidePanelContactHeader;
