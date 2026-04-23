-- liquibase formatted sql

-- changeset copilot:common-ddl-script-v1-add-crm-module-config
ALTER TABLE `module_config`
    ADD COLUMN `crm_module` bit(1) DEFAULT b'1';

-- rollback ALTER TABLE `module_config` DROP COLUMN `crm_module`;
