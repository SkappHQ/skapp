-- liquibase formatted sql

-- changeset anusham:common-ddl-script-v1-create-table-crm-task-type
CREATE TABLE IF NOT EXISTS `crm_task_type` (
    `id`          bigint       NOT NULL AUTO_INCREMENT,
    `name`        varchar(255) NOT NULL,
    `order_index` int          DEFAULT NULL,
    PRIMARY KEY (`id`)
);

-- rollback DROP TABLE IF EXISTS `crm_task_type`;