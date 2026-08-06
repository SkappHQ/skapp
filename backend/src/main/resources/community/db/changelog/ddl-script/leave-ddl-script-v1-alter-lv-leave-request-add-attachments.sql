-- liquibase formatted sql

-- changeset HasalaAbhilasha:leave-ddl-script-v1-alter-lv-leave-request-add-attachments
ALTER TABLE `lv_leave_request`
    ADD COLUMN `attachments` text;

-- rollback ALTER TABLE `lv_leave_request` DROP COLUMN `attachments`;
