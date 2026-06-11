-- liquibase formatted sql

-- changeset thusala:common-ddl-script-v1-alter-table-notification-add-column-is-type-viewed
ALTER TABLE `notification`
    ADD COLUMN `is_type_viewed` BOOLEAN NOT NULL DEFAULT 0;

-- rollback ALTER TABLE `notification` DROP COLUMN `is_type_viewed`;
