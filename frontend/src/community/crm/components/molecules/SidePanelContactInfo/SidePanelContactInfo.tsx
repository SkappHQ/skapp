import {
  BuildingIcon,
  EmailOutlineIcon,
  PhoneIcon
} from "@rootcodelabs/skapp-ui";
import { FC, ReactElement } from "react";

import { IconName } from "~community/common/types/IconTypes";
import SidePanelHeaderInfoItem from "~community/crm/components/atoms/SidePanelHeaderInfoItem/SidePanelHeaderInfoItem";
import { CrmContact } from "~community/crm/types/CommonTypes";

interface Props {
  contact?: CrmContact | null;
  onCompanyClick?: () => void;
}

interface InfoItem {
  icon: ReactElement;
  value: string;
  onClick?: () => void;
  endIcon?: IconName;
}

const SidePanelContactInfo: FC<Props> = ({ contact, onCompanyClick }) => {
  const infoItems: InfoItem[] = [
    {
      icon: (
        <EmailOutlineIcon style={{ color: "var(--color-secondary-icon)" }} />
      ),
      value: contact.email
    },
    {
      icon: <PhoneIcon style={{ color: "var(--color-secondary-icon)" }} />,
      value: contact?.contactNumber ?? "—"
    },
    ...(contact?.company
      ? [
          {
            icon: (
              <BuildingIcon style={{ color: "var(--color-secondary-icon)" }} />
            ),
            value: contact?.company?.name,
            onClick: onCompanyClick,
            endIcon: IconName.POP_OUT_ICON
          }
        ]
      : [])
  ];

  return (
    <div className="flex items-center justify-between max-w-[629px] w-full">
      {infoItems.map(({ ...item }) => (
        <SidePanelHeaderInfoItem {...item} />
      ))}
    </div>
  );
};

export default SidePanelContactInfo;
