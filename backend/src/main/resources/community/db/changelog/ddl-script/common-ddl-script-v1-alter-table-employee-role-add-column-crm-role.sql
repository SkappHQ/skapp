-- liquibase formatted sql

-- changeset anusham:common-ddl-script-v1-alter-table-employee-role-add-column-crm-role
ALTER TABLE `employee_role` ADD COLUMN `crm_role` varchar(255) DEFAULT NULL;

-- rollback ALTER TABLE `employee_role` DROP COLUMN `crm_role`;