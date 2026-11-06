-- liquibase formatted sql

-- changeset UmeshaLiyanage:00017_alter_table_crm_activity_meeting_drop_column_meeting_venue
ALTER TABLE `crm_activity_meeting`
    DROP COLUMN `meeting_venue`;

-- rollback ALTER TABLE `crm_activity_meeting` ADD COLUMN `meeting_venue` TEXT;
