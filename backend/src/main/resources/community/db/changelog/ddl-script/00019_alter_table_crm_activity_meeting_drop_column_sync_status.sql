-- liquibase formatted sql

-- changeset UmeshaLiyanage:00019_alter_table_crm_activity_meeting_drop_column_sync_status
ALTER TABLE `crm_activity_meeting`
    DROP COLUMN `sync_status`;

-- rollback ALTER TABLE `crm_activity_meeting` ADD COLUMN `sync_status` TEXT;
