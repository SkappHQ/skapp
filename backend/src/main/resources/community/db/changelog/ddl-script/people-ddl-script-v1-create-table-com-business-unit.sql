-- liquibase formatted sql

-- changeset shakila:people-ddl-script-v1-create-table-com-business-unit
CREATE TABLE IF NOT EXISTS `com_business_unit`
(
    `id`                 bigint      NOT NULL AUTO_INCREMENT,
    `name`               text        NOT NULL,
    `description`        text,
    `created_by`         text,
    `created_date`       datetime(6),
    `last_modified_by`   text,
    `last_modified_date` datetime(6),
    PRIMARY KEY (`id`)
);

-- rollback DROP TABLE `com_business_unit`;
