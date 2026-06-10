import {
  BrowserIcon,
  BuildingIcon,
  LocationIcon,
  PhoneIcon
} from "@rootcodelabs/skapp-ui";
import React from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import SidePanelHeaderInfoItem from "~community/crm/components/atoms/SidePanelHeaderInfoItem/SidePanelHeaderInfoItem";
import { CrmCompanyType } from "~community/crm/types/CommonTypes";

const ICON_STROKE = "var(--color-secondary-icon)";

interface Props {
  company: CrmCompanyType;
}

const SidePanelCompanyHeader: React.FC<Props> = ({ company }) => {
  const translateText = useTranslator(
    "crmModule",
    "companies",
    "industryOptions"
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between max-w-[80%]">
        {company.website && (
          <SidePanelHeaderInfoItem
            icon={<BrowserIcon stroke={ICON_STROKE} width="20" height="20" />}
            value={company.website}
            endIcon={IconName.POP_OUT_ICON}
            onClick={() =>
              window.open(company.website, "_blank", "noopener,noreferrer")
            }
          />
        )}
        {company.contactNumber && (
          <SidePanelHeaderInfoItem
            icon={<PhoneIcon stroke={ICON_STROKE} width="20" height="20" />}
            value={company.contactNumber}
          />
        )}
        {company.address && (
          <SidePanelHeaderInfoItem
            icon={<LocationIcon stroke={ICON_STROKE} width="20" height="20" />}
            value={company.address}
          />
        )}
        {company.industry && (
          <SidePanelHeaderInfoItem
            icon={<BuildingIcon stroke={ICON_STROKE} width="20" height="20" />}
            value={translateText([company.industry])}
          />
        )}
      </div>
    </div>
  );
};

export default SidePanelCompanyHeader;
