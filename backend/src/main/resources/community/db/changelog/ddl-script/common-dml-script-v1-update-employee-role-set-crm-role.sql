-- liquibase formatted sql

-- changeset anusham:common-dml-script-v1-update-employee-role-set-crm-role
UPDATE `employee_role`
SET `crm_role` = CASE
    WHEN `is_super_admin` = 1 THEN 'CRM_ADMIN'
    ELSE 'CRM_SALES_REP'
END
WHERE `crm_role` IS NULL;

-- rollback UPDATE `employee_role` SET `crm_role` = NULL WHERE `crm_role` IN ('CRM_ADMIN', 'CRM_SALES_REP');
