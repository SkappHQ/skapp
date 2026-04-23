-- liquibase formatted sql

-- changeset anusham:common-ddl-script-v1-create-table-crm-pipeline-template
CREATE TABLE IF NOT EXISTS `crm_pipeline_template` (
    `id`                 bigint       NOT NULL AUTO_INCREMENT,
    `name`               varchar(255) NOT NULL,
    `description`        text,
    `is_deleted`         boolean      NOT NULL DEFAULT FALSE,
    `created_by`         varchar(255) DEFAULT NULL,
    `created_date`       datetime(6)  DEFAULT NULL,
    `last_modified_by`   varchar(255) DEFAULT NULL,
    `last_modified_date` datetime(6)  DEFAULT NULL,
    PRIMARY KEY (`id`)
);

-- rollback DROP TABLE IF EXISTS `crm_pipeline_template`;