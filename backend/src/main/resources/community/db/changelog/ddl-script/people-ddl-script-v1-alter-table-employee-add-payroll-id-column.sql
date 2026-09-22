-- liquibase formatted sql

-- changeset shakila:people-ddl-script-v1-alter-table-employee-add-payroll-id-column
ALTER TABLE `employee`
    ADD COLUMN `payroll_id` text;

-- rollback ALTER TABLE `employee` DROP COLUMN `payroll_id`;
