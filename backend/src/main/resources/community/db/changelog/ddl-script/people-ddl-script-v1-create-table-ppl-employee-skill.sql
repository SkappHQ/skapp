-- liquibase formatted sql

-- changeset system:people-ddl-script-v1-create-table-ppl-employee-skill
CREATE TABLE IF NOT EXISTS `ppl_employee_skill`
(
    `employee_id` bigint       NOT NULL,
    `skill_id`    bigint       NOT NULL,
    CONSTRAINT `PK_ppl_employee_skill` PRIMARY KEY (`employee_id`, `skill_id`),
    CONSTRAINT `FK_ppl_employee_skill_employee_id` FOREIGN KEY (`employee_id`) REFERENCES `employee` (`employee_id`)
);

-- rollback DROP TABLE `ppl_employee_skill`;
