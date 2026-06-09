import {
  BuildingIcon,
  EmailOutlineIcon,
  PhoneIcon
} from "@rootcodelabs/skapp-ui";
import { FC, ReactElement } from "react";

import { IconName } from "~community/common/types/IconTypes";
import SidePanelHeaderInfoItem from "~community/crm/components/atoms/SidePanelHeaderInfoItem/SidePanelHeaderInfoItem";
import { CrmContactType } from "~community/crm/types/CommonTypes";
import { formatTextValue } from "~community/crm/utils/crmUtil";

interface Props {
  contact?: CrmContactType;
  onCompanyClick?: () => void;
}

interface InfoItem {
  icon: ReactElement;
  value: string;
  onClick?: () => void;
  endIcon?: IconName;
}

const SidePanelContactHeader: FC<Props> = ({ contact, onCompanyClick }) => {
  if (!contact) return null;

  const company = contact.company;

  const iconColor = { color: "var(--color-secondary-icon)" };

  const infoItems: InfoItem[] = [
    {
      icon: <EmailOutlineIcon style={iconColor} />,
      value: contact.email
    },
    {
      icon: <PhoneIcon style={iconColor} />,
      value: contact.contactNumber ?? "—"
    },
    ...(company
      ? [
          {
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
      {infoItems.map(({ ...item }) => (
        <SidePanelHeaderInfoItem {...item} />
      ))}
    </div>
  );
};

export default SidePanelContactHeader;
