-- liquibase formatted sql

-- changeset anusham:common-dml-script-v1-update-employee-role-set-crm-role
UPDATE `employee_role`
SET `crm_role` = 'CRM_ADMIN'
WHERE `is_super_admin` = b'1';

-- rollback UPDATE `employee_role` SET `crm_role` = NULL WHERE `crm_role` IN ('CRM_ADMIN', 'CRM_SALES_REP');
