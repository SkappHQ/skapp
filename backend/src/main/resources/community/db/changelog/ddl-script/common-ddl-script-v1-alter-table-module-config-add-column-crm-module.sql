-- liquibase formatted sql

-- changeset anusham:common-ddl-script-v1-alter-table-module-config-add-column-crm-module
ALTER TABLE `module_config`
    ADD COLUMN `crm_module` bit(1) DEFAULT b'1';

-- rollback ALTER TABLE `module_config` DROP COLUMN `crm_module`;
