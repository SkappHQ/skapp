-- liquibase formatted sql

-- changeset copilot:common-ddl-script-v1-add-crm-employee-role
ALTER TABLE `employee_role`
    ADD COLUMN `crm_role` varchar(50) DEFAULT NULL;

-- rollback ALTER TABLE `employee_role` DROP COLUMN `crm_role`;
