-- liquibase formatted sql

-- changeset HasalaAbhilasha:leave-dml-script-v1-migrate-leave-type-data
INSERT INTO `lv_leave_type` (`name`, `emoji_code`, `color_code`, `min_duration`, `is_attachment`,
                              `is_attachment_must`, `is_comment_must`, `is_auto_approval`, `is_active`,
                              `created_date`, `last_modified_date`)
SELECT lt.`name`,
       lt.`emoji_code`,
       lt.`color_code`,
       lt.`min_duration`,
       COALESCE(lt.`is_attachment`, FALSE),
       COALESCE(lt.`is_attachment_must`, FALSE),
       COALESCE(lt.`is_comment_must`, FALSE),
       COALESCE(lt.`is_auto_approval`, FALSE),
       COALESCE(lt.`is_active`, TRUE),
       NOW(),
       NOW()
FROM `leave_type` lt
WHERE NOT EXISTS (
    SELECT 1 FROM `lv_leave_type` nlt WHERE nlt.`name` = lt.`name`
);

-- rollback DELETE FROM `lv_leave_type`;
