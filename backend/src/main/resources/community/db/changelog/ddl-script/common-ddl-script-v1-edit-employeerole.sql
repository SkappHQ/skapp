-- liquibase formatted sql

-- changeset BojithaPiyathilake:common-ddl-script-v1-edit-employeerole
ALTER TABLE `employee_role`
    ADD COLUMN `okr_role` varchar(255) DEFAULT NULL
;

-- rollback ALTER TABLE `employee_role` DROP COLUMN `okr_role`;