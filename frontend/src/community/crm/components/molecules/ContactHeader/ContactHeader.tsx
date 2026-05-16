import { Skeleton } from "@mui/material";
import { FC } from "react";

import { IconName } from "~community/common/types/IconTypes";
import ContactInfoItem from "~community/crm/components/atoms/ContactInfoItem/ContactInfoItem";
import { CrmContactType } from "~community/crm/types/CrmContactTypes";

import styles from "./styles";

interface Props {
  contact?: CrmContactType;
  isLoading?: boolean;
}

const ContactHeader: FC<Props> = ({ contact, isLoading }) => {
  const cls = styles;

  return (
    <div className={cls.wrapper}>
      {isLoading ? (
        <div className={cls.infoSkeleton}>
          <Skeleton width="60%" height={20} animation="wave" />
          <Skeleton width="80%" height={20} animation="wave" />
          <Skeleton width="70%" height={20} animation="wave" />
        </div>
      ) : contact ? (
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
      ) : null}
    </div>
  );
};

export default ContactHeader;
