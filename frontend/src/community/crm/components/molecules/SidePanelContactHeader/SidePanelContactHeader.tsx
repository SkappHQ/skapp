import {
  BuildingIcon,
  EmailOutlineIcon,
  PhoneIcon
} from "@rootcodelabs/skapp-ui";
import { FC, ReactElement } from "react";

import { IconName } from "~community/common/types/IconTypes";
import SidePanelHeaderInfoItem from "~community/crm/components/atoms/SidePanelHeaderInfoItem/SidePanelHeaderInfoItem";
import { CrmContactType } from "~community/crm/types/CommonTypes";

interface Props {
  contact?: CrmContactType;
  onCompanyClick?: () => void;
}

interface InfoItem {
  key: string;
  icon: ReactElement;
  value: string | null;
  onClick?: () => void;
  endIcon?: IconName;
}

const SidePanelContactHeader: FC<Props> = ({ contact, onCompanyClick }) => {
  if (!contact) return null;

  const company = contact.company;

  const iconColor = { color: "var(--color-secondary-icon)" };

  const infoItems: InfoItem[] = [
    {
      key: "email",
      icon: <EmailOutlineIcon style={iconColor} />,
      value: contact.email
    },
    {
      key: "phone",
      icon: <PhoneIcon style={iconColor} />,
      value: contact.contactNumber
    },
    ...(company
      ? [
          {
            key: "company",
            icon: <BuildingIcon style={iconColor} />,
            value: company.name,
            onClick: onCompanyClick,
            endIcon: IconName.POP_OUT_ICON
          }
        ]
      : [])
  ];

  return (
    <div className="flex items-center justify-between max-w-[629px] w-full">
      {infoItems.map(({ key, ...item }) => (
        <SidePanelHeaderInfoItem key={key} {...item} />
      ))}
    </div>
  );
};

export default SidePanelContactHeader;
