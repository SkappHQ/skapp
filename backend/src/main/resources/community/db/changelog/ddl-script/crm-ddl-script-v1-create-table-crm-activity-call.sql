-- liquibase formatted sql

-- changeset umeshaliyanage:crm-ddl-script-v1-create-table-crm-activity-call
CREATE TABLE IF NOT EXISTS `crm_activity_call`
(
    `id`                 bigint      NOT NULL AUTO_INCREMENT,
    `subject`            TEXT        NOT NULL,
    `duration`           int                  DEFAULT NULL,
    `logged_at`          datetime(6) NOT NULL,
    `comments`           TEXT                 DEFAULT NULL,
    `owner_id`           bigint      NOT NULL,
    `contact_id`         bigint      NOT NULL,
    `deal_id`            bigint               DEFAULT NULL,
    `company_id`         bigint               DEFAULT NULL,
    `is_deleted`         boolean     NOT NULL DEFAULT FALSE,
    `created_by`         TEXT                 DEFAULT NULL,
    `created_date`       datetime(6)          DEFAULT NULL,
    `last_modified_by`   TEXT                 DEFAULT NULL,
    `last_modified_date` datetime(6)          DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `IDX_crm_activity_call_owner_id_logged_at` (`owner_id`, `logged_at`),
    KEY `IDX_crm_activity_call_logged_at` (`logged_at`),
    CONSTRAINT `FK_crm_activity_call_employee_owner_id` FOREIGN KEY (`owner_id`) REFERENCES `employee` (`employee_id`),
    CONSTRAINT `FK_crm_activity_call_crm_contact_contact_id` FOREIGN KEY (`contact_id`) REFERENCES `crm_contact` (`id`),
    CONSTRAINT `FK_crm_activity_call_crm_deal_deal_id` FOREIGN KEY (`deal_id`) REFERENCES `crm_deal` (`id`),
    CONSTRAINT `FK_crm_activity_call_crm_company_company_id` FOREIGN KEY (`company_id`) REFERENCES `crm_company` (`id`)
);

-- rollback DROP TABLE IF EXISTS `crm_activity_call`;
