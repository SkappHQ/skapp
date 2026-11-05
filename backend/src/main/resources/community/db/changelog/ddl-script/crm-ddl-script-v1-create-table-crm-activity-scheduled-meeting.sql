-- liquibase formatted sql

-- changeset UmeshaLiyanage:crm-ddl-script-v1-create-table-crm-activity-scheduled-meeting
CREATE TABLE IF NOT EXISTS `crm_activity_scheduled_meeting`
(
    `meeting_id`        bigint NOT NULL,
    `meeting_venue`     TEXT,
    `location`          TEXT,
    `location_address`  TEXT,
    `location_url`      TEXT,
    `calendar_provider` TEXT,
    `external_event_id` TEXT,
    PRIMARY KEY (`meeting_id`),
    CONSTRAINT `FK_crm_activity_scheduled_meeting_crm_activity_meeting_meeting_id` FOREIGN KEY (`meeting_id`) REFERENCES `crm_activity_meeting` (`id`)
);

-- rollback DROP TABLE IF EXISTS `crm_activity_scheduled_meeting`;
