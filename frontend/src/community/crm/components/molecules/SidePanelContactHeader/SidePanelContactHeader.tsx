import { BuildingIcon } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { formatISODateWithSuffixLocal } from "~community/common/utils/dateTimeUtils";
import { ContactHeaderSkeleton } from "~community/crm/components/atoms/SidePanelContactInfoItem/ContactInfoItemSkeleton";
import SidePanelContactInfoItem from "~community/crm/components/atoms/SidePanelContactInfoItem/SidePanelContactInfoItem";
import { CrmContactType } from "~community/crm/types/CommonTypes";

interface Props {
  contact?: CrmContactType;
  isLoading?: boolean;
  companyHref?: string;
}

const SidePanelContactHeader: FC<Props> = ({
  contact,
  isLoading,
  companyHref
}) => {
  const translateText = useTranslator(
    "crmModule",
    "contacts",
    "contactDetailsPanel"
  );

  const company = contact?.company;

  const renderContent = () => {
    if (isLoading) {
      return <ContactHeaderSkeleton />;
    }

    if (!contact) {
      return null;
    }

    return (
      <>
        <div className="flex items-center justify-between max-w-[629px] w-full">
          <SidePanelContactInfoItem
            icon={IconName.EMAIL_ICON}
            value={contact.email}
          />

          <SidePanelContactInfoItem
            icon={IconName.LOCAL_PHONE_ICON}
            value={contact.contactNumber}
          />

          {company && (
            <SidePanelContactInfoItem
              icon={<BuildingIcon stroke="var(--color-secondary-icon)" />}
              value={company.name}
              href={companyHref}
              endIcon={companyHref ? IconName.POP_OUT_ICON : undefined}
            />
          )}
        </div>
      </>
    );
  };

  return (
    <div className="w-full flex flex-col gap-[8px] items-start">
      {renderContent()}
    </div>
  );
};

export default SidePanelContactHeader;
