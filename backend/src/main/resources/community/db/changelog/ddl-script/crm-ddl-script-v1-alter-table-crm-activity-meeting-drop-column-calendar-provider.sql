-- liquibase formatted sql

-- changeset UmeshaLiyanage:crm-ddl-script-v1-alter-table-crm-activity-meeting-drop-column-calendar-provider
ALTER TABLE `crm_activity_meeting`
    DROP COLUMN `calendar_provider`;

-- rollback ALTER TABLE `crm_activity_meeting` ADD COLUMN `calendar_provider` TEXT;
