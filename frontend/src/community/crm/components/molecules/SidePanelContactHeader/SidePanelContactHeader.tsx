import { BuildingIcon } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { formatISODateWithSuffixLocal } from "~community/common/utils/dateTimeUtils";
import { ContactHeaderSkeleton } from "~community/crm/components/atoms/SidePanelContactInfoItem/ContactInfoItemSkeleton";
import SidePanelContactInfoItem from "~community/crm/components/atoms/SidePanelContactInfoItem/SidePanelContactInfoItem";
import { CrmContactType } from "~community/crm/types/CommonTypes";

import cls, { COLORS } from "./styles";

interface Props {
  contact?: CrmContactType;
  isLoading?: boolean;
  onCompanyClick?: (companyId: number) => void;
}

const SidePanelContactHeader: FC<Props> = ({
  contact,
  isLoading,
  onCompanyClick
}) => {
  const translateText = useTranslator(
    "crmModule",
    "contacts",
    "contactDetailsPanel"
  );

  const company = contact?.company;

  return (
    <div className={cls.wrapper}>
      {isLoading ? (
        <ContactHeaderSkeleton />
      ) : contact ? (
        <>
          <div className={cls.contactHeader}>
            <h2 className={cls.contactName}>{contact.name}</h2>
            <p className={cls.lastUpdated}>
              {`${translateText(["lastUpdated"])} : ${formatISODateWithSuffixLocal(contact.lastModifiedDate)}`}
            </p>
          </div>
          <div className={cls.infoRow}>
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
                icon={<BuildingIcon stroke={COLORS.iconFill} />}
                value={company.name}
                // TODO: Open company side panel
                onClick={
                  onCompanyClick
                    ? () => {
                        onCompanyClick(company.id);
                      }
                    : undefined
                }
                endIcon={IconName.POP_OUT_ICON}
              />
            )}
          </div>
        </>
      ) : null}
    </div>
  );
};

export default SidePanelContactHeader;
