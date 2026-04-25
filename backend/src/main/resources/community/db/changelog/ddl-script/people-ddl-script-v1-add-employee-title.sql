-- liquibase formatted sql

-- changeset system:people-ddl-script-v1-add-employee-title
ALTER TABLE `employee`
    ADD COLUMN `title` varchar(20) NULL
;

-- rollback ALTER TABLE `employee` DROP COLUMN `title`;
