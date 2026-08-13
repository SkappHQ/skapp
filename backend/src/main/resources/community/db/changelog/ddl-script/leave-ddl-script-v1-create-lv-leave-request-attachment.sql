-- liquibase formatted sql

-- changeset HasalaAbhilasha:leave-ddl-script-v1-create-lv-leave-request-attachment
CREATE TABLE IF NOT EXISTS `lv_leave_request_attachment`
(
    `id`                 bigint      NOT NULL AUTO_INCREMENT,
    `leave_request_id`   bigint      NOT NULL,
    `file_url`           text        NOT NULL,
    `original_file_name` text,
    `created_by`         text,
    `created_date`       datetime(6),
    `last_modified_by`   text,
    `last_modified_date` datetime(6),
    PRIMARY KEY (`id`),
    CONSTRAINT `FK_lv_leave_request_attachment_lv_leave_request_leave_request_id` FOREIGN KEY (`leave_request_id`) REFERENCES `lv_leave_request` (`id`)
);

-- rollback DROP TABLE IF EXISTS `lv_leave_request_attachment`;
