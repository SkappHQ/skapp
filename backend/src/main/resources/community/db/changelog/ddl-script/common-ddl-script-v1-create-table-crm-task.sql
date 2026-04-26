-- liquibase formatted sql

-- changeset anusham:common-ddl-script-v1-create-table-crm-task
CREATE TABLE IF NOT EXISTS `crm_task` (
    `id`                 bigint       NOT NULL AUTO_INCREMENT,
    `name`               varchar(255) NOT NULL,
    `type_id`            bigint       NOT NULL,
    `priority_id`        bigint       NOT NULL,
    `status_id`          bigint       NOT NULL,
    `due_date`           datetime(6)  DEFAULT NULL,
    `notes`              text,
    `owner_id`           bigint       NOT NULL,
    `contact_id`         bigint       DEFAULT NULL,
    `company_id`         bigint       DEFAULT NULL,
    `deal_id`            bigint       DEFAULT NULL,
    `is_deleted`         boolean      NOT NULL DEFAULT FALSE,
    `created_by`         varchar(255) DEFAULT NULL,
    `created_date`       datetime(6)  DEFAULT NULL,
    `last_modified_by`   varchar(255) DEFAULT NULL,
    `last_modified_date` datetime(6)  DEFAULT NULL,
    PRIMARY KEY (`id`),
    CONSTRAINT `FK_crm_task_crm_task_type_type_id`
        FOREIGN KEY (`type_id`) REFERENCES `crm_task_type` (`id`),
    CONSTRAINT `FK_crm_task_crm_task_priority_priority_id`
        FOREIGN KEY (`priority_id`) REFERENCES `crm_task_priority` (`id`),
    CONSTRAINT `FK_crm_task_crm_task_status_status_id`
        FOREIGN KEY (`status_id`) REFERENCES `crm_task_status` (`id`),
    CONSTRAINT `FK_crm_task_employee_owner_id`
        FOREIGN KEY (`owner_id`) REFERENCES `employee` (`employee_id`),
    CONSTRAINT `FK_crm_task_crm_contact_contact_id`
        FOREIGN KEY (`contact_id`) REFERENCES `crm_contact` (`id`),
    CONSTRAINT `FK_crm_task_crm_company_company_id`
        FOREIGN KEY (`company_id`) REFERENCES `crm_company` (`id`),
    CONSTRAINT `FK_crm_task_crm_deal_deal_id`
        FOREIGN KEY (`deal_id`) REFERENCES `crm_deal` (`id`)
);

-- rollback DROP TABLE IF EXISTS `crm_task`;