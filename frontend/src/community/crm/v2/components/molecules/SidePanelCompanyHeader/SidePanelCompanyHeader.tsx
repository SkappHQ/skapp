import {
  BrowserIcon,
  LocationIcon,
  OfficeIcon,
  PhoneIcon
} from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { openInNewTab } from "~community/common/utils/commonUtil";
import SidePanelHeaderInfoItem from "~community/crm/v2/components/molecules/SidePanelHeaderInfoItem/SidePanelHeaderInfoItem";
import { CrmCompanyEntity } from "~community/crm/v2/types/CrmCommonTypes";

interface SidePanelCompanyHeaderProps {
  company: CrmCompanyEntity;
}

const SidePanelCompanyHeader: FC<SidePanelCompanyHeaderProps> = ({
  company
}) => {
  const translateText = useTranslator(
    "crmModule",
    "companies",
    "industryOptions"
  );

  const { website, contactNumber, address, industry } = company;

  return (
    <div className="flex items-center gap-12 flex-wrap">
      {website && (
        <SidePanelHeaderInfoItem
          icon={
            <BrowserIcon
              width="20"
              height="20"
              fill="var(--color-secondary-icon)"
            />
          }
          value={website}
          endIcon={IconName.POP_OUT_ICON}
          onClick={() => openInNewTab(website)}
        />
      )}
      {contactNumber && (
        <SidePanelHeaderInfoItem
          icon={
            <PhoneIcon
              width="20"
              height="20"
              stroke="var(--color-secondary-icon)"
            />
          }
          value={contactNumber}
        />
      )}
      {address && (
        <SidePanelHeaderInfoItem
          icon={
            <LocationIcon
              width="20"
              height="20"
              fill="var(--color-secondary-icon)"
            />
          }
          value={address}
        />
      )}
      {industry && (
        <SidePanelHeaderInfoItem
          icon={
            <OfficeIcon
              width="20"
              height="20"
              fill="var(--color-secondary-icon)"
            />
          }
          value={translateText([industry])}
        />
      )}
    </div>
  );
};

export default SidePanelCompanyHeader;
