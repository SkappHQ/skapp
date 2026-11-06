-- liquibase formatted sql

-- changeset UmeshaLiyanage:00018_alter_table_crm_activity_meeting_drop_column_location
ALTER TABLE `crm_activity_meeting`
    DROP COLUMN `location`;

-- rollback ALTER TABLE `crm_activity_meeting` ADD COLUMN `location` TEXT;
