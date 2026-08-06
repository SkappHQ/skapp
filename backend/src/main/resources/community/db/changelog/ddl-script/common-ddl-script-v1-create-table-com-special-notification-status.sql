-- liquibase formatted sql

-- changeset GainduNuhansith:00122_create_table_com_special_notification_status
CREATE TABLE IF NOT EXISTS `com_special_notification_status`
(
    `employee_id`               bigint       NOT NULL,
    `special_notification_type` varchar(255) NOT NULL,
    `last_viewed_date`          date         NOT NULL,
    `created_by`                text                  DEFAULT NULL,
    `created_date`              datetime(6)           DEFAULT NULL,
    `last_modified_by`          text                  DEFAULT NULL,
    `last_modified_date`        datetime(6)           DEFAULT NULL,
    CONSTRAINT `PK_com_special_notification_status` PRIMARY KEY (`employee_id`, `special_notification_type`),
    CONSTRAINT `FK_com_special_notification_status_employee_employee_id` FOREIGN KEY
(
    `employee_id`
) REFERENCES `employee`
(
    `employee_id`
)
);

-- rollback DROP TABLE IF EXISTS `com_special_notification_status`;
