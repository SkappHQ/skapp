-- liquibase formatted sql

-- changeset UmeshaLiyanage:crm-dml-script-v1-copy-crm-activity-meeting-schedule-columns
INSERT INTO `crm_activity_scheduled_meeting` (`meeting_id`, `meeting_venue`, `location`, `calendar_provider`, `created_by`,
                                              `created_date`, `last_modified_by`, `last_modified_date`)
SELECT `id`, `meeting_venue`, `location`, `calendar_provider`, `created_by`, `created_date`, `last_modified_by`,
       `last_modified_date`
FROM `crm_activity_meeting`
WHERE `is_scheduled` = TRUE;

-- rollback DELETE FROM `crm_activity_scheduled_meeting` WHERE `meeting_id` IN (SELECT `id` FROM `crm_activity_meeting` WHERE `is_scheduled` = TRUE);
