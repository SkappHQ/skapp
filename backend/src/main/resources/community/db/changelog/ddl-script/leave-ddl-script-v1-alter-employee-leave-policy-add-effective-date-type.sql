-- liquibase formatted sql

-- changeset ThusalaPiyarisi:leave-ddl-script-v1-alter-employee-leave-policy-add-effective-date-type
ALTER TABLE `lv_employee_leave_policy`
    ADD COLUMN `effective_date_type` text NOT NULL;

-- rollback ALTER TABLE `lv_employee_leave_policy` DROP COLUMN `effective_date_type`;
