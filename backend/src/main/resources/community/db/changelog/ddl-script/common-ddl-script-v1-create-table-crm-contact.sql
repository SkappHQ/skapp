-- liquibase formatted sql

-- changeset anusham:common-ddl-script-v1-create-table-crm-contact
CREATE TABLE IF NOT EXISTS `crm_contact` (
    `id`                 bigint       NOT NULL AUTO_INCREMENT,
    `name`               varchar(255) NOT NULL,
    `email`              varchar(255) NOT NULL,
    `contact_number`     varchar(50)  DEFAULT NULL,
    `company_id`         bigint       DEFAULT NULL,
    `owner_id`           bigint       NOT NULL,
    `is_deleted`         boolean      NOT NULL DEFAULT FALSE,
    `created_by`         varchar(255) DEFAULT NULL,
    `created_date`       datetime(6)  DEFAULT NULL,
    `last_modified_by`   varchar(255) DEFAULT NULL,
    `last_modified_date` datetime(6)  DEFAULT NULL,
    PRIMARY KEY (`id`),
    CONSTRAINT `FK_crm_contact_crm_company_company_id`
        FOREIGN KEY (`company_id`) REFERENCES `crm_company` (`id`),
    CONSTRAINT `FK_crm_contact_employee_owner_id`
        FOREIGN KEY (`owner_id`) REFERENCES `employee` (`employee_id`)
);

-- rollback DROP TABLE IF EXISTS `crm_contact`;