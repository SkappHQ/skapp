-- liquibase formatted sql

-- changeset HasalaAbhilasha:people-ddl-script-v1-alter-table-employee-add-leave-authorizer-id
ALTER TABLE `employee`
    ADD COLUMN `leave_authorizer_id` bigint,
    ADD CONSTRAINT `FK_employee_employee_leave_authorizer_id` FOREIGN KEY (`leave_authorizer_id`) REFERENCES `employee` (`employee_id`);

-- rollback ALTER TABLE `employee` DROP FOREIGN KEY `FK_employee_employee_leave_authorizer_id`, DROP COLUMN `leave_authorizer_id`;
