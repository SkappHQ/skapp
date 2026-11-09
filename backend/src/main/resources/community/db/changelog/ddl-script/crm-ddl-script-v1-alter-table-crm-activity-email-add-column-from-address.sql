-- liquibase formatted sql

-- changeset UmeshaLiyanage:crm-ddl-script-v1-alter-table-crm-activity-email-add-column-from-address
ALTER TABLE `crm_activity_email`
    ADD COLUMN `from_address` TEXT;

-- rollback ALTER TABLE `crm_activity_email` DROP COLUMN `from_address`;
