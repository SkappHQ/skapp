import { FC } from "react";

import { IconName } from "~community/common/types/IconTypes";
import ContactInfoItem from "~community/crm/components/atoms/SidePanelContactInfoItem/SidePanelContactInfoItem";
import {
  ContactHeaderSkeleton,
  ContactInfoItemSkeleton
} from "~community/crm/components/atoms/SidePanelContactInfoItem/ContactInfoItemSkeleton";
import { ContactDetail } from "~community/crm/types/CommonTypes";

import styles from "./styles";
import { formatLastUpdated } from "~community/crm/utils/contactHeaderUtils";
import { useTranslator } from "~community/common/hooks/useTranslator";

interface Props {
  contact?: ContactDetail;
  isLoading?: boolean;
  onCompanyClick?: (companyId: number) => void;
}

const ContactHeader: FC<Props> = ({ contact, isLoading, onCompanyClick }) => {
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
            <p className={cls.contactName}>
              {contact.name}
            </p>
            <p className={cls.lastUpdated}>
              {translateText(["lastUpdated"])} :{" "}
              {formatLastUpdated(contact.lastContactedAt ?? null)}
            </p>
          </div>
          <div className={cls.infoRow}>
            <ContactInfoItem icon={IconName.EMAIL_ICON} value={contact.email} />

            <ContactInfoItem
              icon={IconName.LOCAL_PHONE_ICON}
              value={contact.contactNumber}
            />

            {contact.company && (
              <ContactInfoItem
                icon={IconName.BUILDING_ICON}
                value={contact.company.name}
                // TODO: Open company side panel
                onClick={() => onCompanyClick?.(contact.company!.id)}
                endIcon={IconName.POP_OUT_ICON}
              />
            )}
          </div>
        </>
      ) : null}
    </div>
  );
};

export default ContactHeader;
