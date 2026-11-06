-- liquibase formatted sql

-- changeset UmeshaLiyanage:00020_alter_table_crm_activity_meeting_drop_column_calendar_provider
ALTER TABLE `crm_activity_meeting`
    DROP COLUMN `calendar_provider`;

-- rollback ALTER TABLE `crm_activity_meeting` ADD COLUMN `calendar_provider` TEXT;
