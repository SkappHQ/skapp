-- liquibase formatted sql

-- changeset UmeshaLiyanage:crm-dml-script-v1-migrate-crm-task-to-crm-activity-task
INSERT INTO `crm_activity_task` (`id`, `name`, `due_at`, `priority`, `is_completed`, `completed_at`, `notes`,
                                 `owner_id`, `contact_id`, `deal_id`, `company_id`, `is_deleted`,
                                 `created_by`, `created_date`, `last_modified_by`, `last_modified_date`)
SELECT t.`id`,
       t.`name`,
       COALESCE(t.`due_at`, t.`created_date`, UTC_TIMESTAMP(6)),
       t.`priority`,
       t.`is_completed`,
       CASE WHEN t.`is_completed` THEN COALESCE(t.`last_modified_date`, t.`created_date`) END,
       t.`notes`, t.`owner_id`, t.`contact_id`, t.`deal_id`, t.`company_id`, t.`is_deleted`,
       t.`created_by`, t.`created_date`, t.`last_modified_by`, t.`last_modified_date`
FROM `crm_task` t
WHERE NOT EXISTS (SELECT 1 FROM `crm_activity_task` a WHERE a.`id` = t.`id`);

-- rollback DELETE a FROM `crm_activity_task` a JOIN `crm_task` t ON t.`id` = a.`id`;
