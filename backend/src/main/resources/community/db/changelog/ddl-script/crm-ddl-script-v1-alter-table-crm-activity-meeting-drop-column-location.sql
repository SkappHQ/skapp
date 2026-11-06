-- liquibase formatted sql

-- changeset UmeshaLiyanage:crm-ddl-script-v1-alter-table-crm-activity-meeting-drop-column-location
ALTER TABLE `crm_activity_meeting`
    DROP COLUMN `location`;

-- rollback ALTER TABLE `crm_activity_meeting` ADD COLUMN `location` TEXT;
