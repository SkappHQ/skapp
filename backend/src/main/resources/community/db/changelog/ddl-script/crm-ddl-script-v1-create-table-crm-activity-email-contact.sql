-- liquibase formatted sql

-- changeset UmeshaLiyanage:crm-ddl-script-v1-create-table-crm-activity-email-contact
CREATE TABLE IF NOT EXISTS `crm_activity_email_contact`
(
    `email_id`   bigint NOT NULL,
    `contact_id` bigint NOT NULL,
    `role`       TEXT,
    PRIMARY KEY (`email_id`, `contact_id`),
    CONSTRAINT `FK_crm_activity_email_contact_crm_activity_email_email_id` FOREIGN KEY (`email_id`) REFERENCES `crm_activity_email` (`id`),
    CONSTRAINT `FK_crm_activity_email_contact_crm_contact_contact_id` FOREIGN KEY (`contact_id`) REFERENCES `crm_contact` (`id`)
);

-- rollback DROP TABLE IF EXISTS `crm_activity_email_contact`;
