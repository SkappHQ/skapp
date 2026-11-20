-- liquibase formatted sql

-- changeset HasalaAbhilasha:leave-ddl-script-v1-alter-table-lv-leave-request-add-multi-level-approval-columns
ALTER TABLE `lv_leave_request`
    ADD COLUMN `is_multi_level`        boolean,
    ADD COLUMN `leave_authorizer_id`   bigint,
    ADD COLUMN `primary_approved_by`   bigint,
    ADD COLUMN `primary_approved_date` datetime(6),
    ADD CONSTRAINT `FK_lv_leave_request_employee_leave_authorizer_id` FOREIGN KEY (`leave_authorizer_id`) REFERENCES `employee` (`employee_id`),
    ADD CONSTRAINT `FK_lv_leave_request_employee_primary_approved_by` FOREIGN KEY (`primary_approved_by`) REFERENCES `employee` (`employee_id`);

-- rollback ALTER TABLE `lv_leave_request` DROP FOREIGN KEY `FK_lv_leave_request_employee_leave_authorizer_id`, DROP FOREIGN KEY `FK_lv_leave_request_employee_primary_approved_by`, DROP COLUMN `is_multi_level`, DROP COLUMN `leave_authorizer_id`, DROP COLUMN `primary_approved_by`, DROP COLUMN `primary_approved_date`;
