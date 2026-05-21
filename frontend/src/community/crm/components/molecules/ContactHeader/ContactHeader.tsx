import { Skeleton } from "@mui/material";
import { FC } from "react";

import { IconName } from "~community/common/types/IconTypes";
import ContactInfoItem from "~community/crm/components/atoms/ContactInfoItem/ContactInfoItem";
import { ContactDetail } from "~community/crm/types/CommonTypes";

import styles from "./styles";
import { formatLastUpdated } from "~community/crm/utils/contactHeaderUtils";
import { useTranslator } from "~community/common/hooks/useTranslator";

interface Props {
  contact?: ContactDetail;
  isLoading?: boolean;
}

const ContactHeader: FC<Props> = ({ contact, isLoading }) => {
  const cls = styles;
  const translateText = useTranslator(
    "crmModule",
    "contacts",
    "contactDetailsPanel"
  );

  return (
    <div id="contact-panel-title" className={cls.wrapper}>
      {isLoading ? (
        <div className="flex flex-col gap-[8px]">
          <Skeleton width={180} height={28} animation="wave" />
          <Skeleton width={120} height={16} animation="wave" />
        </div>
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
                isLink={true}
                linkHref={"#"}
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
