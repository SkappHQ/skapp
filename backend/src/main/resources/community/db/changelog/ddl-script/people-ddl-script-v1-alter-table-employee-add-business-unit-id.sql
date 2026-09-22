-- liquibase formatted sql

-- changeset shakila:people-ddl-script-v1-alter-table-employee-add-business-unit-id
ALTER TABLE `employee`
    ADD COLUMN `business_unit_id` bigint DEFAULT NULL,
    ADD CONSTRAINT `FK_employee_com_business_unit_id` FOREIGN KEY (`business_unit_id`) REFERENCES `com_business_unit` (`id`) ON DELETE SET NULL;

-- rollback ALTER TABLE `employee` DROP FOREIGN KEY `FK_employee_com_business_unit_id`;
-- rollback ALTER TABLE `employee` DROP COLUMN `business_unit_id`;
