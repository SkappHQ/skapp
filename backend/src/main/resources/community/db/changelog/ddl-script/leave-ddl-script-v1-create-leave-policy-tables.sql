-- liquibase formatted sql

-- changeset HasalaAbhilasha:leave-ddl-script-v1-create-leave-policy-tables
CREATE TABLE IF NOT EXISTS `lv_leave_type`
(
    `id`                 bigint      NOT NULL AUTO_INCREMENT,
    `name`               text        NOT NULL,
    `emoji_code`         text,
    `color_code`         text,
    `min_duration`       text        NOT NULL,
    `is_attachment`      boolean     NOT NULL,
    `is_attachment_must` boolean     NOT NULL,
    `is_comment_must`    boolean     NOT NULL,
    `is_auto_approval`   boolean     NOT NULL,
    `is_active`          boolean     NOT NULL,
    `created_by`         text,
    `created_date`       datetime(6),
    `last_modified_by`   text,
    `last_modified_date` datetime(6),
    PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `lv_leave_policy`
(
    `id`                   bigint      NOT NULL AUTO_INCREMENT,
    `name`                 text        NOT NULL,
    `leave_type_id`        bigint      NOT NULL,
    `policy_type`          text        NOT NULL,
    `status`               text        NOT NULL,
    `accrual_days`         float,
    `frequency`            text,
    `waiting_period_days`  int,
    `accrual_cap_days`     float,
    `is_carryover_enabled` boolean     NOT NULL,
    `carryover_date`       text,
    `max_carryover_days`   float,
    `first_accrual`        text,
    `accrual_timing`       text,
    `created_by`           text,
    `created_date`         datetime(6),
    `last_modified_by`     text,
    `last_modified_date`   datetime(6),
    PRIMARY KEY (`id`),
    CONSTRAINT `FK_lv_leave_policy_lv_leave_type_leave_type_id` FOREIGN KEY (`leave_type_id`) REFERENCES `lv_leave_type` (`id`)
);

CREATE TABLE IF NOT EXISTS `lv_employee_leave_policy`
(
    `id`                 bigint      NOT NULL AUTO_INCREMENT,
    `employee_id`        bigint      NOT NULL,
    `policy_id`          bigint      NOT NULL,
    `effective_from`     date        NOT NULL,
    `effective_to`       date,
    `status`             text        NOT NULL,
    `ended_reason`       text,
    `created_by`         text,
    `created_date`       datetime(6),
    `last_modified_by`   text,
    `last_modified_date` datetime(6),
    PRIMARY KEY (`id`),
    CONSTRAINT `FK_lv_employee_leave_policy_employee_employee_id` FOREIGN KEY (`employee_id`) REFERENCES `employee` (`employee_id`),
    CONSTRAINT `FK_lv_employee_leave_policy_lv_leave_policy_policy_id` FOREIGN KEY (`policy_id`) REFERENCES `lv_leave_policy` (`id`)
);

CREATE TABLE IF NOT EXISTS `lv_leave_request`
(
    `id`                 bigint      NOT NULL AUTO_INCREMENT,
    `employee_id`        bigint      NOT NULL,
    `reviewer_id`        bigint,
    `policy_id`          bigint      NOT NULL,
    `start_date`         date        NOT NULL,
    `end_date`           date        NOT NULL,
    `leave_state`        text        NOT NULL,
    `status`             text        NOT NULL,
    `duration_days`      float       NOT NULL,
    `description`        text,
    `reviewer_comment`   text,
    `reviewed_date`      datetime(6),
    `is_auto_approved`   boolean,
    `is_viewed`          boolean,
    `event_id`           text,
    `created_by`         text,
    `created_date`       datetime(6),
    `last_modified_by`   text,
    `last_modified_date` datetime(6),
    PRIMARY KEY (`id`),
    CONSTRAINT `FK_lv_leave_request_employee_employee_id` FOREIGN KEY (`employee_id`) REFERENCES `employee` (`employee_id`),
    CONSTRAINT `FK_lv_leave_request_employee_reviewer_id` FOREIGN KEY (`reviewer_id`) REFERENCES `employee` (`employee_id`),
    CONSTRAINT `FK_lv_leave_request_lv_leave_policy_policy_id` FOREIGN KEY (`policy_id`) REFERENCES `lv_leave_policy` (`id`)
);

-- rollback DROP TABLE IF EXISTS `lv_leave_request`;
-- rollback DROP TABLE IF EXISTS `lv_employee_leave_policy`;
-- rollback DROP TABLE IF EXISTS `lv_leave_policy`;
-- rollback DROP TABLE IF EXISTS `lv_leave_type`;
