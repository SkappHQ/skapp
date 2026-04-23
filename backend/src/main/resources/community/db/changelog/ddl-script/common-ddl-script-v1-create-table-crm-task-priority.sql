-- liquibase formatted sql

-- changeset anusham:common-ddl-script-v1-create-table-crm-task-priority
CREATE TABLE IF NOT EXISTS `crm_task_priority` (
    `id`   bigint       NOT NULL AUTO_INCREMENT,
    `name` varchar(255) NOT NULL,
    PRIMARY KEY (`id`)
);

-- rollback DROP TABLE IF EXISTS `crm_task_priority`;