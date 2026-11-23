-- liquibase formatted sql

-- changeset HasalaAbhilasha:leave-ddl-script-v1-alter-table-lv-leave-request-add-column-is-multi-level
ALTER TABLE `lv_leave_request`
    ADD COLUMN `is_multi_level` boolean;

-- rollback ALTER TABLE `lv_leave_request` DROP COLUMN `is_multi_level`;
