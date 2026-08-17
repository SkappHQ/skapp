-- liquibase formatted sql

-- changeset HasalaAbhilasha:leave-ddl-script-v1-alter-leave-policy-rename-carryover-expiry-date
ALTER TABLE `lv_leave_policy`
    CHANGE COLUMN `carryover_date` `carryover_expiry_date` text;

-- rollback ALTER TABLE `lv_leave_policy` CHANGE COLUMN `carryover_expiry_date` `carryover_date` text;
