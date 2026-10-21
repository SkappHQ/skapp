-- liquibase formatted sql

-- changeset UmeshaLiyanage:crm-ddl-script-v1-create-table-crm-activity-task
CREATE TABLE IF NOT EXISTS `crm_activity_task`
(
    `id`                 bigint      NOT NULL AUTO_INCREMENT,
    `name`               TEXT,
    `due_at`             datetime(6),
    `priority`           TEXT,
    `is_completed`       boolean,
    `completed_at`       datetime(6),
    `notes`              TEXT,
    `owner_id`           bigint,
    `contact_id`         bigint,
    `deal_id`            bigint,
    `company_id`         bigint,
    `is_deleted`         boolean,
    `created_by`         TEXT,
    `created_date`       datetime(6),
    `last_modified_by`   TEXT,
    `last_modified_date` datetime(6),
    PRIMARY KEY (`id`),
    CONSTRAINT `FK_crm_activity_task_employee_owner_id` FOREIGN KEY (`owner_id`) REFERENCES `employee` (`employee_id`),
    CONSTRAINT `FK_crm_activity_task_crm_contact_contact_id` FOREIGN KEY (`contact_id`) REFERENCES `crm_contact` (`id`),
    CONSTRAINT `FK_crm_activity_task_crm_deal_deal_id` FOREIGN KEY (`deal_id`) REFERENCES `crm_deal` (`id`),
    CONSTRAINT `FK_crm_activity_task_crm_company_company_id` FOREIGN KEY (`company_id`) REFERENCES `crm_company` (`id`)
);

-- rollback DROP TABLE IF EXISTS `crm_activity_task`;
