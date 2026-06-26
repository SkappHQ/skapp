-- liquibase formatted sql

-- changeset kalsaramagamage:common-ddl-script-v1-add-employee-esign-role

ALTER TABLE `employee_role`
    ADD COLUMN `esign_role` varchar(255) DEFAULT NULL;

-- rollback ALTER TABLE `employee_role` DROP COLUMN `esign_role`;