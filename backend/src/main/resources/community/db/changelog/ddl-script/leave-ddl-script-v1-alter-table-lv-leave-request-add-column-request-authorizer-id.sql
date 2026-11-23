-- liquibase formatted sql

-- changeset HasalaAbhilasha:leave-ddl-script-v1-alter-table-lv-leave-request-add-column-request-authorizer-id
ALTER TABLE `lv_leave_request`
    ADD COLUMN `request_authorizer_id` bigint,
    ADD CONSTRAINT `FK_lv_leave_request_employee_request_authorizer_id` FOREIGN KEY (`request_authorizer_id`) REFERENCES `employee` (`employee_id`);

-- rollback ALTER TABLE `lv_leave_request` DROP FOREIGN KEY `FK_lv_leave_request_employee_request_authorizer_id`, DROP COLUMN `request_authorizer_id`;
