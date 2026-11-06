-- liquibase formatted sql

-- changeset UmeshaLiyanage:crm-ddl-script-v1-alter-table-crm-activity-meeting-drop-column-meeting-venue
ALTER TABLE `crm_activity_meeting`
    DROP COLUMN `meeting_venue`;

-- rollback ALTER TABLE `crm_activity_meeting` ADD COLUMN `meeting_venue` TEXT;
