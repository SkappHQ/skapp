-- liquibase formatted sql

-- changeset shakila:people-ddl-script-v1-alter-table-com-work-location-add-is-deleted
ALTER TABLE `com_work_location`
    ADD COLUMN `is_deleted` boolean NOT NULL;

-- rollback ALTER TABLE `com_work_location` DROP COLUMN `is_deleted`;
