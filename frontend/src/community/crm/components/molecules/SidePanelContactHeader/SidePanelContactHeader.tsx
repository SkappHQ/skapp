import { BuildingIcon } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { formatISODateWithSuffixLocal } from "~community/common/utils/dateTimeUtils";
import { ContactHeaderSkeleton } from "~community/crm/components/atoms/SidePanelContactInfoItem/ContactInfoItemSkeleton";
import SidePanelContactInfoItem from "~community/crm/components/atoms/SidePanelContactInfoItem/SidePanelContactInfoItem";
import { CrmContactType } from "~community/crm/types/CommonTypes";

import styles from "./styles";

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
  const cls = styles;
  const translateText = useTranslator(
    "crmModule",
    "contacts",
    "contactDetailsPanel"
  );

  return (
    <div id="contact-panel-title" className={cls.wrapper}>
      {isLoading ? (
        <ContactHeaderSkeleton />
      ) : contact ? (
        <>
          <div className={cls.contactHeader}>
            <p className={cls.contactName}>{contact.name}</p>
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

            {contact.company && (
              <SidePanelContactInfoItem
                icon={<BuildingIcon stroke={cls.iconFill} />}
                value={contact.company.name}
                // TODO: Open company side panel
                onClick={
                  onCompanyClick
                    ? () => {
                        if (contact.company) onCompanyClick(contact.company.id);
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
