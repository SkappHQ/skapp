-- liquibase formatted sql

-- changeset shakila:people-ddl-script-v1-alter-table-employee-add-tin-column
ALTER TABLE `employee`
    ADD COLUMN `tin` text;

-- rollback ALTER TABLE `employee` DROP COLUMN `tin`;
