-- liquibase formatted sql

-- changeset umeshaliyanage:crm-ddl-script-v1-create-table-crm-activity-meeting
CREATE TABLE IF NOT EXISTS `crm_activity_meeting`
(
    `id`                 bigint      NOT NULL AUTO_INCREMENT,
    `name`               TEXT        NOT NULL,
    `is_scheduled`       boolean     NOT NULL DEFAULT FALSE,
    `meeting_venue`      TEXT                 DEFAULT NULL,
    `location`           TEXT                 DEFAULT NULL,
    `meeting_date`       date        NOT NULL,
    `start_time`         time        NOT NULL,
    `end_time`           time        NOT NULL,
    `sync_status`        TEXT                 DEFAULT NULL,
    `calendar_provider`  TEXT                 DEFAULT NULL,
    `comments`           TEXT                 DEFAULT NULL,
    `owner_id`           bigint      NOT NULL,
    `deal_id`            bigint               DEFAULT NULL,
    `company_id`         bigint               DEFAULT NULL,
    `is_deleted`         boolean     NOT NULL DEFAULT FALSE,
    `created_by`         TEXT                 DEFAULT NULL,
    `created_date`       datetime(6)          DEFAULT NULL,
    `last_modified_by`   TEXT                 DEFAULT NULL,
    `last_modified_date` datetime(6)          DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `IDX_crm_activity_meeting_owner_id_meeting_date` (`owner_id`, `meeting_date`),
    KEY `IDX_crm_activity_meeting_meeting_date` (`meeting_date`),
    CONSTRAINT `FK_crm_activity_meeting_employee_owner_id` FOREIGN KEY (`owner_id`) REFERENCES `employee` (`employee_id`),
    CONSTRAINT `FK_crm_activity_meeting_crm_deal_deal_id` FOREIGN KEY (`deal_id`) REFERENCES `crm_deal` (`id`),
    CONSTRAINT `FK_crm_activity_meeting_crm_company_company_id` FOREIGN KEY (`company_id`) REFERENCES `crm_company` (`id`)
);

-- rollback DROP TABLE IF EXISTS `crm_activity_meeting`;
