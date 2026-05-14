import { FC } from "react";

import { IconName } from "~community/common/types/IconTypes";
import ContactInfoItem from "~community/crm/components/atoms/ContactInfoItem/ContactInfoItem";
import { CrmContactType } from "~community/crm/types/CrmContactTypes";

import styles from "./styles";

interface Props {
  contact: CrmContactType;
}

const ContactHeader: FC<Props> = ({ contact }) => {
  const cls = styles;

  return (
    <div className={cls.wrapper}>
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
            isLink={!!contact.company.website}
            linkHref={contact.company.website ?? undefined}
            endIcon={
              contact.company.website ? IconName.NEW_WINDOW_ICON : undefined
            }
          />
        )}
      </div>
    </div>
  );
};

export default ContactHeader;
