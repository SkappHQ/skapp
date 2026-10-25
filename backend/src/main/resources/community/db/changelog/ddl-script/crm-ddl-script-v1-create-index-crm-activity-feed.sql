-- liquibase formatted sql

-- changeset UmeshaLiyanage:crm-ddl-script-v1-create-index-crm-activity-feed
CREATE INDEX `idx_crm_activity_task_feed` ON `crm_activity_task` (`owner_id`, `is_deleted`, `due_at`);
CREATE INDEX `idx_crm_activity_call_feed` ON `crm_activity_call` (`owner_id`, `is_deleted`, `logged_at`);
CREATE INDEX `idx_crm_activity_meeting_feed` ON `crm_activity_meeting` (`owner_id`, `is_deleted`, `start_at`);
CREATE INDEX `idx_crm_activity_email_feed` ON `crm_activity_email` (`owner_id`, `is_deleted`, `logged_at`);
