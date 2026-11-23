-- liquibase formatted sql

-- changeset HasalaAbhilasha:leave-ddl-script-v1-alter-table-lv-leave-request-add-column-primary-reviewer-id
ALTER TABLE `lv_leave_request`
    ADD COLUMN `primary_reviewer_id` bigint,
    ADD CONSTRAINT `FK_lv_leave_request_employee_primary_reviewer_id` FOREIGN KEY (`primary_reviewer_id`) REFERENCES `employee` (`employee_id`);

-- rollback ALTER TABLE `lv_leave_request` DROP FOREIGN KEY `FK_lv_leave_request_employee_primary_reviewer_id`, DROP COLUMN `primary_reviewer_id`;
