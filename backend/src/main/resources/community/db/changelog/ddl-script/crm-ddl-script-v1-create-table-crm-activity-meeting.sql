-- liquibase formatted sql

-- changeset UmeshaLiyanage:crm-ddl-script-v1-create-table-crm-activity-meeting
CREATE TABLE IF NOT EXISTS `crm_activity_meeting`
(
    `id`                 bigint      AUTO_INCREMENT,
    `name`               TEXT,
    `is_scheduled`       boolean,
    `meeting_venue`      TEXT,
    `location`           TEXT,
    `meeting_date`       date,
    `start_at`           datetime(6),
    `end_at`             datetime(6),
    `sync_status`        TEXT,
    `calendar_provider`  TEXT,
    `comments`           TEXT,
    `owner_id`           bigint,
    `deal_id`            bigint,
    `company_id`         bigint,
    `is_deleted`         boolean,
    `created_by`         TEXT,
    `created_date`       datetime(6),
    `last_modified_by`   TEXT,
    `last_modified_date` datetime(6),
    PRIMARY KEY (`id`),
    CONSTRAINT `FK_crm_activity_meeting_employee_owner_id` FOREIGN KEY (`owner_id`) REFERENCES `employee` (`employee_id`),
    CONSTRAINT `FK_crm_activity_meeting_crm_deal_deal_id` FOREIGN KEY (`deal_id`) REFERENCES `crm_deal` (`id`),
    CONSTRAINT `FK_crm_activity_meeting_crm_company_company_id` FOREIGN KEY (`company_id`) REFERENCES `crm_company` (`id`)
);

-- rollback DROP TABLE IF EXISTS `crm_activity_meeting`;
