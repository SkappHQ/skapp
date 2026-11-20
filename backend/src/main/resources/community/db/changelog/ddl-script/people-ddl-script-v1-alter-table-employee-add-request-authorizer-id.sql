-- liquibase formatted sql

-- changeset HasalaAbhilasha:people-ddl-script-v1-alter-table-employee-add-request-authorizer-id
ALTER TABLE `employee`
    ADD COLUMN `request_authorizer_id` bigint,
    ADD CONSTRAINT `FK_employee_employee_request_authorizer_id` FOREIGN KEY (`request_authorizer_id`) REFERENCES `employee` (`employee_id`) ON DELETE SET NULL;

-- rollback ALTER TABLE `employee` DROP FOREIGN KEY `FK_employee_employee_request_authorizer_id`, DROP COLUMN `request_authorizer_id`;
