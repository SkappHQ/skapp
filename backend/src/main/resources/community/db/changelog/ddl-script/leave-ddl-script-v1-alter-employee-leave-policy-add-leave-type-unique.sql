-- liquibase formatted sql

-- changeset ThusalaPiyarisi:leave-ddl-script-v1-alter-employee-leave-policy-add-leave-type-unique
-- Denormalized leave_type_id, populated only while a window is ACTIVE and nulled on close.
-- The unique (employee_id, leave_type_id) index lets the DB enforce "at most one open
-- window per (employee, leave type)" without locks; ENDED rows carry NULL and MySQL allows
-- duplicate NULLs in a unique index.
ALTER TABLE `lv_employee_leave_policy`
    ADD COLUMN `leave_type_id` bigint DEFAULT NULL;

ALTER TABLE `lv_employee_leave_policy`
    ADD CONSTRAINT `FK_lv_employee_leave_policy_lv_leave_type_leave_type_id`
        FOREIGN KEY (`leave_type_id`) REFERENCES `lv_leave_type` (`id`);

ALTER TABLE `lv_employee_leave_policy`
    ADD CONSTRAINT `UK_lv_employee_leave_policy_employee_leave_type` UNIQUE (`employee_id`, `leave_type_id`);

-- rollback ALTER TABLE `lv_employee_leave_policy` DROP INDEX `UK_lv_employee_leave_policy_employee_leave_type`;
-- rollback ALTER TABLE `lv_employee_leave_policy` DROP FOREIGN KEY `FK_lv_employee_leave_policy_lv_leave_type_leave_type_id`;
-- rollback ALTER TABLE `lv_employee_leave_policy` DROP COLUMN `leave_type_id`;
