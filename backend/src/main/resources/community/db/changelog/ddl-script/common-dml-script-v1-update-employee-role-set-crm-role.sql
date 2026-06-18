-- liquibase formatted sql

-- changeset anusham:common-dml-script-v1-update-employee-role-set-crm-role
UPDATE `employee_role`
SET `crm_role` = CASE WHEN `is_super_admin` = b'1' THEN 'CRM_ADMIN' ELSE 'CRM_NONE' END;

-- rollback UPDATE `employee_role` SET `crm_role` = NULL WHERE `crm_role` IN ('CRM_ADMIN', 'CRM_NONE');
