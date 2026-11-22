-- liquibase formatted sql

-- changeset HasalaAbhilasha:leave-ddl-script-v1-alter-table-lv-leave-request-add-multi-level-approval-columns
ALTER TABLE `lv_leave_request`
    ADD COLUMN `is_multi_level`        boolean,
    ADD COLUMN `request_authorizer_id` bigint,
    ADD COLUMN `primary_reviewer_id`   bigint,
    ADD COLUMN `primary_reviewed_date` datetime(6),
    ADD CONSTRAINT `FK_lv_leave_request_employee_request_authorizer_id` FOREIGN KEY (`request_authorizer_id`) REFERENCES `employee` (`employee_id`),
    ADD CONSTRAINT `FK_lv_leave_request_employee_primary_reviewer_id` FOREIGN KEY (`primary_reviewer_id`) REFERENCES `employee` (`employee_id`);

-- rollback ALTER TABLE `lv_leave_request` DROP FOREIGN KEY `FK_lv_leave_request_employee_request_authorizer_id`, DROP FOREIGN KEY `FK_lv_leave_request_employee_primary_reviewer_id`, DROP COLUMN `is_multi_level`, DROP COLUMN `request_authorizer_id`, DROP COLUMN `primary_reviewer_id`, DROP COLUMN `primary_reviewed_date`;
