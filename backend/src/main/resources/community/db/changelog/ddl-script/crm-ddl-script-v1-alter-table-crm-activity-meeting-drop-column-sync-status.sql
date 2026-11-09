-- liquibase formatted sql

-- changeset UmeshaLiyanage:crm-ddl-script-v1-alter-table-crm-activity-meeting-drop-column-sync-status
ALTER TABLE `crm_activity_meeting`
    DROP COLUMN `sync_status`;

-- rollback ALTER TABLE `crm_activity_meeting` ADD COLUMN `sync_status` TEXT;
