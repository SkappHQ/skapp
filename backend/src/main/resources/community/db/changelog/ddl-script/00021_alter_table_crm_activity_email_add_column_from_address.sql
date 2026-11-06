-- liquibase formatted sql

-- changeset UmeshaLiyanage:00021_alter_table_crm_activity_email_add_column_from_address
ALTER TABLE `crm_activity_email`
    ADD COLUMN `from_address` TEXT;

-- rollback ALTER TABLE `crm_activity_email` DROP COLUMN `from_address`;
