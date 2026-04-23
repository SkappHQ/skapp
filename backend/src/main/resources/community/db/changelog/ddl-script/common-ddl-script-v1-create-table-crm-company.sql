-- liquibase formatted sql

-- changeset anusham:common-ddl-script-v1-create-table-crm-company
CREATE TABLE IF NOT EXISTS `crm_company` (
    `id`                 bigint       NOT NULL AUTO_INCREMENT,
    `name`               varchar(255) NOT NULL,
    `industry`           varchar(255) DEFAULT NULL,
    `website`            varchar(255) DEFAULT NULL,
    `address`            varchar(255) DEFAULT NULL,
    `contact_number`     varchar(50)  DEFAULT NULL,
    `is_deleted`         boolean      NOT NULL DEFAULT FALSE,
    `created_by`         varchar(255) DEFAULT NULL,
    `created_date`       datetime(6)  DEFAULT NULL,
    `last_modified_by`   varchar(255) DEFAULT NULL,
    `last_modified_date` datetime(6)  DEFAULT NULL,
    PRIMARY KEY (`id`)
);

-- rollback DROP TABLE IF EXISTS `crm_company`;