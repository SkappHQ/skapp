-- liquibase formatted sql

-- changeset UmeshaLiyanage:crm-ddl-script-v1-create-index-crm-activity-task-owner-id-is-deleted
CREATE INDEX `idx_crm_activity_task_owner_id_is_deleted` ON `crm_activity_task` (`owner_id`, `is_deleted`);
-- rollback DROP INDEX `idx_crm_activity_task_owner_id_is_deleted` ON `crm_activity_task`;

-- changeset UmeshaLiyanage:crm-ddl-script-v1-create-index-crm-activity-task-due-at
CREATE INDEX `idx_crm_activity_task_due_at` ON `crm_activity_task` (`due_at`);
-- rollback DROP INDEX `idx_crm_activity_task_due_at` ON `crm_activity_task`;

-- changeset UmeshaLiyanage:crm-ddl-script-v1-create-index-crm-activity-task-completed-at
CREATE INDEX `idx_crm_activity_task_completed_at` ON `crm_activity_task` (`completed_at`);
-- rollback DROP INDEX `idx_crm_activity_task_completed_at` ON `crm_activity_task`;

-- changeset UmeshaLiyanage:crm-ddl-script-v1-create-index-crm-activity-call-owner-id-is-deleted
CREATE INDEX `idx_crm_activity_call_owner_id_is_deleted` ON `crm_activity_call` (`owner_id`, `is_deleted`);
-- rollback DROP INDEX `idx_crm_activity_call_owner_id_is_deleted` ON `crm_activity_call`;

-- changeset UmeshaLiyanage:crm-ddl-script-v1-create-index-crm-activity-call-logged-at
CREATE INDEX `idx_crm_activity_call_logged_at` ON `crm_activity_call` (`logged_at`);
-- rollback DROP INDEX `idx_crm_activity_call_logged_at` ON `crm_activity_call`;

-- changeset UmeshaLiyanage:crm-ddl-script-v1-create-index-crm-activity-meeting-owner-id-is-deleted
CREATE INDEX `idx_crm_activity_meeting_owner_id_is_deleted` ON `crm_activity_meeting` (`owner_id`, `is_deleted`);
-- rollback DROP INDEX `idx_crm_activity_meeting_owner_id_is_deleted` ON `crm_activity_meeting`;

-- changeset UmeshaLiyanage:crm-ddl-script-v1-create-index-crm-activity-meeting-start-at
CREATE INDEX `idx_crm_activity_meeting_start_at` ON `crm_activity_meeting` (`start_at`);
-- rollback DROP INDEX `idx_crm_activity_meeting_start_at` ON `crm_activity_meeting`;

-- changeset UmeshaLiyanage:crm-ddl-script-v1-create-index-crm-activity-email-owner-id-is-deleted
CREATE INDEX `idx_crm_activity_email_owner_id_is_deleted` ON `crm_activity_email` (`owner_id`, `is_deleted`);
-- rollback DROP INDEX `idx_crm_activity_email_owner_id_is_deleted` ON `crm_activity_email`;

-- changeset UmeshaLiyanage:crm-ddl-script-v1-create-index-crm-activity-email-logged-at
CREATE INDEX `idx_crm_activity_email_logged_at` ON `crm_activity_email` (`logged_at`);
-- rollback DROP INDEX `idx_crm_activity_email_logged_at` ON `crm_activity_email`;

-- changeset UmeshaLiyanage:crm-ddl-script-v1-create-index-crm-activity-meeting-contact-contact-id
CREATE INDEX `idx_crm_activity_meeting_contact_contact_id` ON `crm_activity_meeting_contact` (`contact_id`);
-- rollback DROP INDEX `idx_crm_activity_meeting_contact_contact_id` ON `crm_activity_meeting_contact`;

-- changeset UmeshaLiyanage:crm-ddl-script-v1-create-index-crm-activity-email-contact-contact-id
CREATE INDEX `idx_crm_activity_email_contact_contact_id` ON `crm_activity_email_contact` (`contact_id`);
-- rollback DROP INDEX `idx_crm_activity_email_contact_contact_id` ON `crm_activity_email_contact`;
