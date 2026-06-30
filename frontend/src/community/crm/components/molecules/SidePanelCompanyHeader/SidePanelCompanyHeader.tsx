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
import SidePanelHeaderInfoItem from "~community/crm/components/atoms/SidePanelHeaderInfoItem/SidePanelHeaderInfoItem";
import { CrmCompanyMetricsType } from "~community/crm/types/CommonTypes";

interface Props {
  company: CrmCompanyMetricsType;
}

const SidePanelCompanyHeader: FC<Props> = ({ company }) => {
  const translateText = useTranslator(
    "crmModule",
    "companies",
    "industryOptions"
  );

  return (
    <div className="flex items-center justify-between w-auto">
      {company.website && (
        <SidePanelHeaderInfoItem
          icon={
            <BrowserIcon
              width="20"
              height="20"
              fill="var(--color-secondary-icon)"
            />
          }
          value={company.website}
          endIcon={IconName.POP_OUT_ICON}
          onClick={() => openInNewTab(company.website)}
        />
      )}
      {company.contactNumber && (
        <SidePanelHeaderInfoItem
          icon={
            <PhoneIcon
              width="20"
              height="20"
              stroke="var(--color-secondary-icon)"
            />
          }
          value={company.contactNumber}
        />
      )}
      {company.address && (
        <SidePanelHeaderInfoItem
          icon={
            <LocationIcon
              width="20"
              height="20"
              fill="var(--color-secondary-icon)"
            />
          }
          value={company.address}
        />
      )}
      {company.industry && (
        <SidePanelHeaderInfoItem
          icon={
            <OfficeIcon
              width="20"
              height="20"
              fill="var(--color-secondary-icon)"
            />
          }
          value={translateText([company.industry])}
        />
      )}
    </div>
  );
};

export default SidePanelCompanyHeader;
