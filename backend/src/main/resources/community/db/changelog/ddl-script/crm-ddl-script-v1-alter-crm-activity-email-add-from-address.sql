-- liquibase formatted sql

-- changeset UmeshaLiyanage:crm-ddl-script-v1-alter-crm-activity-email-add-from-address
ALTER TABLE `crm_activity_email`
    ADD COLUMN `from_address` TEXT NULL;

-- rollback ALTER TABLE `crm_activity_email` DROP COLUMN `from_address`;
