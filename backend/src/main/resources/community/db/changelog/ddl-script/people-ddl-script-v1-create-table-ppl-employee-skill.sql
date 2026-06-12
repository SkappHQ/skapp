-- liquibase formatted sql

-- changeset shakila:00115_create_table_employee_skill
CREATE TABLE IF NOT EXISTS `ppl_employee_skill`
(
    `employee_id` bigint       NOT NULL,
    `skill_id`    bigint       NOT NULL,
    `skill_type`  VARCHAR(255) NOT NULL,
    CONSTRAINT `PK_ppl_employee_skill` PRIMARY KEY (`employee_id`, `skill_id`, `skill_type`),
    CONSTRAINT `FK_ppl_employee_skill_employee_id` FOREIGN KEY (`employee_id`) REFERENCES `employee` (`employee_id`) ON DELETE CASCADE
);

-- rollback DROP TABLE `ppl_employee_skill`;
