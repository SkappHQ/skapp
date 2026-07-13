-- liquibase formatted sql

-- changeset HasalaAbhilasha:leave-ddl-script-v1-create-leave-policy-tables
CREATE TABLE IF NOT EXISTS `lv_leave_type`
(
    `type_id`            bigint       NOT NULL AUTO_INCREMENT,
    `name`               varchar(100) NOT NULL,
    `emoji_code`         varchar(255) DEFAULT NULL,
    `color_code`         varchar(255) DEFAULT NULL,
    `min_duration`       varchar(255) NOT NULL,
    `is_attachment`      bit(1)       NOT NULL DEFAULT 0,
    `is_attachment_must` bit(1)       NOT NULL DEFAULT 0,
    `is_comment_must`    bit(1)       NOT NULL DEFAULT 0,
    `is_auto_approval`   bit(1)       NOT NULL DEFAULT 0,
    `is_active`          bit(1)       NOT NULL DEFAULT 1,
    `created_by`         varchar(255) DEFAULT NULL,
    `created_date`       datetime(6)  DEFAULT NULL,
    `last_modified_by`   varchar(255) DEFAULT NULL,
    `last_modified_date` datetime(6)  DEFAULT NULL,
    PRIMARY KEY (`type_id`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `lv_leave_policy`
(
    `policy_id`                      bigint       NOT NULL AUTO_INCREMENT,
    `name`                           varchar(100) NOT NULL,
    `leave_type_id`                  bigint       NOT NULL,
    `policy_type`                    varchar(255) NOT NULL,
    `status`                         varchar(255) NOT NULL,
    `fixed_days_allocated`           float        DEFAULT NULL,
    `is_carry_forward_enabled`       bit(1)       NOT NULL DEFAULT 0,
    `max_carry_forward_days`         float        DEFAULT NULL,
    `carry_forward_expiry_date`      date         DEFAULT NULL,
    `accrual_days`                   float        DEFAULT NULL,
    `frequency`                      varchar(255) DEFAULT NULL,
    `waiting_period_days`            int          DEFAULT NULL,
    `accrual_cap_days`               float        DEFAULT NULL,
    `is_carryover_enabled`           bit(1)       NOT NULL DEFAULT 0,
    `carryover_date`                 varchar(5)   DEFAULT NULL,
    `is_reset_negative_on_carryover` bit(1)       NOT NULL DEFAULT 0,
    `first_accrual`                  varchar(255) DEFAULT NULL,
    `accrual_timing`                 varchar(255) DEFAULT NULL,
    `created_by`                     varchar(255) DEFAULT NULL,
    `created_date`                   datetime(6)  DEFAULT NULL,
    `last_modified_by`               varchar(255) DEFAULT NULL,
    `last_modified_date`             datetime(6)  DEFAULT NULL,
    PRIMARY KEY (`policy_id`),
    CONSTRAINT `FK_lv_leave_policy_lv_leave_type_leave_type_id` FOREIGN KEY (`leave_type_id`) REFERENCES `lv_leave_type` (`type_id`)
) ENGINE = InnoDB;

-- rollback DROP TABLE IF EXISTS `lv_leave_policy`;
-- rollback DROP TABLE IF EXISTS `lv_leave_type`;
