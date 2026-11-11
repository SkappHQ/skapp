-- liquibase formatted sql

-- changeset SanithuGunasena:people-ddl-script-v1-create-table-ppl-employee-billable-rate
CREATE TABLE IF NOT EXISTS `ppl_employee_billable_rate`
(
    `employee_id`        bigint,
    `billable_rate`      double,
    `currency`           text,
    `created_by`         text,
    `created_date`       datetime(6),
    `last_modified_by`   text,
    `last_modified_date` datetime(6),
    PRIMARY KEY (`employee_id`),
    CONSTRAINT `FK_ppl_employee_billable_rate_employee_employee_id` FOREIGN KEY (`employee_id`) REFERENCES `employee` (`employee_id`)
);

-- rollback DROP TABLE IF EXISTS `ppl_employee_billable_rate`;
