-- liquibase formatted sql

-- changeset umeshaliyanage:crm-ddl-script-v1-create-table-crm-activity-email
CREATE TABLE IF NOT EXISTS `crm_activity_email`
(
    `id`                 bigint      NOT NULL AUTO_INCREMENT,
    `subject`            TEXT        NOT NULL,
    `logged_time`        datetime(6) NOT NULL,
    `description`        TEXT                 DEFAULT NULL,
    `owner_id`           bigint      NOT NULL,
    `deal_id`            bigint               DEFAULT NULL,
    `company_id`         bigint               DEFAULT NULL,
    `is_deleted`         boolean     NOT NULL DEFAULT FALSE,
    `created_by`         TEXT                 DEFAULT NULL,
    `created_date`       datetime(6)          DEFAULT NULL,
    `last_modified_by`   TEXT                 DEFAULT NULL,
    `last_modified_date` datetime(6)          DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `IDX_crm_activity_email_owner_id_logged_time` (`owner_id`, `logged_time`),
    KEY `IDX_crm_activity_email_logged_time` (`logged_time`),
    CONSTRAINT `FK_crm_activity_email_employee_owner_id` FOREIGN KEY (`owner_id`) REFERENCES `employee` (`employee_id`),
    CONSTRAINT `FK_crm_activity_email_crm_deal_deal_id` FOREIGN KEY (`deal_id`) REFERENCES `crm_deal` (`id`),
    CONSTRAINT `FK_crm_activity_email_crm_company_company_id` FOREIGN KEY (`company_id`) REFERENCES `crm_company` (`id`)
);

-- rollback DROP TABLE IF EXISTS `crm_activity_email`;
