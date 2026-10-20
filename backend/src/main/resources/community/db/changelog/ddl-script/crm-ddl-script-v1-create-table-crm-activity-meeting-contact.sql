-- liquibase formatted sql

-- changeset umeshaliyanage:crm-ddl-script-v1-create-table-crm-activity-meeting-contact
CREATE TABLE IF NOT EXISTS `crm_activity_meeting_contact`
(
    `meeting_id` bigint NOT NULL,
    `contact_id` bigint NOT NULL,
    PRIMARY KEY (`meeting_id`, `contact_id`),
    KEY `IDX_crm_activity_meeting_contact_contact_id` (`contact_id`),
    CONSTRAINT `FK_crm_activity_meeting_contact_crm_activity_meeting_meeting_id` FOREIGN KEY (`meeting_id`) REFERENCES `crm_activity_meeting` (`id`),
    CONSTRAINT `FK_crm_activity_meeting_contact_crm_contact_contact_id` FOREIGN KEY (`contact_id`) REFERENCES `crm_contact` (`id`)
);

-- rollback DROP TABLE IF EXISTS `crm_activity_meeting_contact`;
