-- liquibase formatted sql

-- changeset HasalaAbhilasha:leave-ddl-script-v1-alter-table-lv-leave-request-add-column-primary-reviewed-date
ALTER TABLE `lv_leave_request`
    ADD COLUMN `primary_reviewed_date` datetime(6);

-- rollback ALTER TABLE `lv_leave_request` DROP COLUMN `primary_reviewed_date`;
