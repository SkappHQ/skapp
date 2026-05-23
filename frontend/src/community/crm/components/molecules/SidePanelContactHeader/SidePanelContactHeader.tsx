import { FC } from "react";

import { IconName } from "~community/common/types/IconTypes";
import ContactInfoItem from "~community/crm/components/atoms/SidePanelContactInfoItem/SidePanelContactInfoItem";
import {
    ContactHeaderSkeleton
} from "~community/crm/components/atoms/SidePanelContactInfoItem/ContactInfoItemSkeleton";
import { ContactDetail } from "~community/crm/types/CommonTypes";

import styles from "./styles";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { formatISODateWithSuffixLocal } from "~community/common/utils/dateTimeUtils";
import { BuildingIcon } from "@rootcodelabs/skapp-ui";

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
                            {`${translateText(["lastUpdated"])} : ${formatISODateWithSuffixLocal(contact.lastModifiedDate)}`}
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
                                icon={<BuildingIcon color={cls.iconFill} />}
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

export default ContactHeader;
