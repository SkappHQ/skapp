-- liquibase formatted sql

-- changeset YuhangaInduwara:common-ddl-script-v1-drop-employee-timeline

DROP TABLE IF EXISTS `employee_timeline`;

-- rollback CREATE TABLE IF NOT EXISTS `employee_timeline`(`timeline_id` bigint NOT NULL AUTO_INCREMENT,`created_by` varchar(255) DEFAULT NULL,`created_date` datetime(6)  DEFAULT NULL,`last_modified_by` varchar(255) DEFAULT NULL,`last_modified_date` datetime(6)  DEFAULT NULL,`display_date` date DEFAULT NULL,`new_value` varchar(255) DEFAULT NULL,`previous_value` varchar(255) DEFAULT NULL,`timeline_type` varchar(255) DEFAULT NULL,`title` varchar(255) DEFAULT NULL, `employee_id` bigint DEFAULT NULL,PRIMARY KEY (`timeline_id`),KEY `IDX_employee_timeline_employee_id` (`employee_id`),CONSTRAINT `FK_employee_timeline_employee_employee_id` FOREIGN KEY (`employee_id`) REFERENCES `employee` (`employee_id`)) ENGINE = InnoDB;
