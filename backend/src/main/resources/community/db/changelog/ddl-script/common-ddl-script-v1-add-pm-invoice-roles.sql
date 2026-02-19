-- liquibase formatted sql

-- changeset system:common-ddl-script-v1-add-pm-invoice-roles
ALTER TABLE `employee_role`
    ADD COLUMN `pm_role` varchar(255) DEFAULT NULL,
    ADD COLUMN `invoice_role` varchar(255) DEFAULT NULL
;

-- rollback ALTER TABLE `employee_role` DROP COLUMN `pm_role`, DROP COLUMN `invoice_role`;
