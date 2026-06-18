-- liquibase formatted sql

-- changeset AkilaSilva:people-ddl-script-v1-alter-table-employee-add-work-location-id
ALTER TABLE `employee`
    ADD COLUMN `work_location_id` bigint DEFAULT NULL,
    ADD CONSTRAINT `FK_employee_work_location` FOREIGN KEY (`work_location_id`) REFERENCES `com_work_location` (`id`);

-- rollback ALTER TABLE `employee` DROP FOREIGN KEY `FK_employee_work_location`, DROP COLUMN `work_location_id`;
