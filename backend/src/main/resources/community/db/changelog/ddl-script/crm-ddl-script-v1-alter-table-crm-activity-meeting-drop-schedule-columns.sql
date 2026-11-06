-- liquibase formatted sql

-- changeset UmeshaLiyanage:crm-ddl-script-v1-alter-table-crm-activity-meeting-drop-schedule-columns
ALTER TABLE `crm_activity_meeting`
    DROP COLUMN `meeting_venue`,
    DROP COLUMN `location`,
    DROP COLUMN `sync_status`,
    DROP COLUMN `calendar_provider`;

-- rollback ALTER TABLE `crm_activity_meeting` ADD COLUMN `meeting_venue` TEXT, ADD COLUMN `location` TEXT, ADD COLUMN `sync_status` TEXT, ADD COLUMN `calendar_provider` TEXT;
