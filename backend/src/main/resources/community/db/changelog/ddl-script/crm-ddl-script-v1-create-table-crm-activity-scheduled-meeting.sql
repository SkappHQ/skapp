-- liquibase formatted sql

-- changeset UmeshaLiyanage:crm-ddl-script-v1-create-table-crm-activity-scheduled-meeting
CREATE TABLE IF NOT EXISTS `crm_activity_scheduled_meeting`
(
    `meeting_id`         bigint,
    `meeting_venue`      TEXT,
    `location`           TEXT,
    `location_address`   TEXT,
    `location_url`       TEXT,
    `calendar_provider`  TEXT,
    `external_event_id`  TEXT,
    `created_by`         TEXT,
    `created_date`       datetime(6),
    `last_modified_by`   TEXT,
    `last_modified_date` datetime(6),
    PRIMARY KEY (`meeting_id`),
    CONSTRAINT `FK_crm_activity_scheduled_meeting_meeting_id` FOREIGN KEY (`meeting_id`) REFERENCES `crm_activity_meeting` (`id`)
);

-- rollback DROP TABLE IF EXISTS `crm_activity_scheduled_meeting`;
