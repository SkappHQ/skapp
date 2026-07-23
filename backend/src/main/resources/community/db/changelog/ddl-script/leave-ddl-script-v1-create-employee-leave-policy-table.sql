-- liquibase formatted sql

-- changeset ThusalaPiyarisi:leave-ddl-script-v1-create-employee-leave-policy-table
CREATE TABLE IF NOT EXISTS `lv_employee_leave_policy`
(
    `employee_policy_id` bigint       NOT NULL AUTO_INCREMENT,
    `employee_id`        bigint       NOT NULL,
    `policy_id`          bigint       NOT NULL,
    `effective_date_type` varchar(255) NOT NULL,
    `effective_from`     date         NOT NULL,
    `effective_to`       date         DEFAULT NULL,
    `status`             varchar(255) NOT NULL,
    `ended_reason`       varchar(255) DEFAULT NULL,
    `created_by`         varchar(255) DEFAULT NULL,
    `created_date`       datetime(6)  DEFAULT NULL,
    `last_modified_by`   varchar(255) DEFAULT NULL,
    `last_modified_date` datetime(6)  DEFAULT NULL,
    PRIMARY KEY (`employee_policy_id`),
    KEY `IDX_lv_employee_leave_policy_employee_id_status` (`employee_id`, `status`),
    KEY `IDX_lv_employee_leave_policy_policy_id_status` (`policy_id`, `status`),
    CONSTRAINT `FK_lv_employee_leave_policy_employee_employee_id`
        FOREIGN KEY (`employee_id`) REFERENCES `employee` (`employee_id`),
    CONSTRAINT `FK_lv_employee_leave_policy_lv_leave_policy_policy_id`
        FOREIGN KEY (`policy_id`) REFERENCES `lv_leave_policy` (`policy_id`)
) ENGINE = InnoDB;

-- rollback DROP TABLE IF EXISTS `lv_employee_leave_policy`;
