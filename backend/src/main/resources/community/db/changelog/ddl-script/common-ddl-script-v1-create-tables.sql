-- liquibase formatted sql

-- changeset AkilaSachintha:common-ddl-script-v1-create-tables
CREATE TABLE IF NOT EXISTS `user`
(
    `user_id`             bigint       NOT NULL AUTO_INCREMENT,
    `email`               varchar(255) NOT NULL,
    `is_active`           bit(1)       NOT NULL,
    `is_password_changed` bit(1)       DEFAULT NULL,
    `password`            varchar(255) NOT NULL,
    `previous_passwords`  varchar(255) DEFAULT NULL,
    `temp_password`       varchar(255) DEFAULT NULL,
    PRIMARY KEY (`user_id`),
    UNIQUE KEY `UK_user_email` (`email`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `organization`
(
    `organization_id`        bigint NOT NULL AUTO_INCREMENT,
    `country`                varchar(100)  DEFAULT NULL,
    `organization_logo`      varchar(100)  DEFAULT NULL,
    `organization_name`      varchar(100)  DEFAULT NULL,
    `organization_website`   varchar(2083) DEFAULT NULL,
    `theme_color`            varchar(9)    DEFAULT NULL,
    `organization_time_zone` varchar(100)  DEFAULT NULL,
    `app_url`                varchar(255)  DEFAULT NULL,
    PRIMARY KEY (`organization_id`),
    UNIQUE KEY `UK_organization_name` (`organization_name`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `job_family`
(
    `job_family_id` bigint      NOT NULL AUTO_INCREMENT,
    `is_active`     bit(1)      NOT NULL,
    `name`          varchar(50) NOT NULL,
    PRIMARY KEY (`job_family_id`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `job_title`
(
    `job_title_id` bigint      NOT NULL AUTO_INCREMENT,
    `is_active`    bit(1)      NOT NULL,
    `title_name`   varchar(50) NOT NULL,
    PRIMARY KEY (`job_title_id`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `team`
(
    `team_id`   bigint NOT NULL AUTO_INCREMENT,
    `is_active` bit(1)      DEFAULT NULL,
    `team_name` varchar(50) DEFAULT NULL,
    PRIMARY KEY (`team_id`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `leave_type`
(
    `type_id`                                    bigint       NOT NULL AUTO_INCREMENT,
    `calculation_type`                           varchar(255) NOT NULL,
    `carry_forward_expiration_date`              date         DEFAULT NULL,
    `carry_forward_expiration_days`              float        DEFAULT NULL,
    `color_code`                                 varchar(255) DEFAULT NULL,
    `emoji_code`                                 varchar(255) DEFAULT NULL,
    `is_active`                                  bit(1)       DEFAULT NULL,
    `is_attachment`                              bit(1)       DEFAULT NULL,
    `is_attachment_must`                         bit(1)       DEFAULT NULL,
    `is_auto_approval`                           bit(1)       DEFAULT NULL,
    `carry_forward_enabled`                      bit(1)       DEFAULT NULL,
    `is_carry_forward_remaining_balance_enabled` bit(1)       DEFAULT NULL,
    `is_comment_must`                            bit(1)       DEFAULT NULL,
    `is_overridden`                              bit(1)       DEFAULT NULL,
    `min_duration`                               varchar(255) NOT NULL,
    `max_carry_forward_days`                     float        DEFAULT NULL,
    `name`                                       varchar(20)  NOT NULL,
    PRIMARY KEY (`type_id`),
    UNIQUE KEY `UK_leave_type_name` (`name`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `attendance_config`
(
    `config_title` varchar(255) NOT NULL,
    `config_value` varchar(255) NOT NULL,
    PRIMARY KEY (`config_title`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `organization_config`
(
    `config_title` varchar(255) NOT NULL,
    `config_value` varchar(255) NOT NULL,
    PRIMARY KEY (`config_title`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `module_role_restriction`
(
    `module`     varchar(255) NOT NULL,
    `is_admin`   bit(1) DEFAULT NULL,
    `is_manager` bit(1) DEFAULT NULL,
    PRIMARY KEY (`module`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `time_config`
(
    `id`                bigint                                                                        NOT NULL AUTO_INCREMENT,
    `day_of_week`       enum ('FRIDAY','MONDAY','SATURDAY','SUNDAY','THURSDAY','TUESDAY','WEDNESDAY') NOT NULL,
    `is_week_start_day` bit(1)                                                                        NOT NULL,
    `start_hour`        int  DEFAULT NULL,
    `start_minute`      int  DEFAULT NULL,
    `time_blocks`       json DEFAULT NULL,
    `total_hours`       float                                                                         NOT NULL,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `employee`
(
    `employee_id`           bigint NOT NULL,
    `created_by`            varchar(255) DEFAULT NULL,
    `created_date`          datetime(6)  DEFAULT NULL,
    `last_modified_by`      varchar(255) DEFAULT NULL,
    `last_modified_date`    datetime(6)  DEFAULT NULL,
    `account_status`        varchar(20)  DEFAULT NULL,
    `address`               varchar(255) DEFAULT NULL,
    `address_line_2`        varchar(255) DEFAULT NULL,
    `auth_pic`              varchar(500) DEFAULT NULL,
    `country`               varchar(255) DEFAULT NULL,
    `employee_type`         varchar(255) DEFAULT NULL,
    `designation`           varchar(255) DEFAULT NULL,
    `eeo`                   varchar(255) DEFAULT NULL,
    `employment_allocation` varchar(255) DEFAULT NULL,
    `first_name`            varchar(50)  DEFAULT NULL,
    `gender`                varchar(20)  DEFAULT NULL,
    `identification_no`     varchar(15)  DEFAULT NULL,
    `join_date`             date         DEFAULT NULL,
    `last_clock_in_date`    date         DEFAULT NULL,
    `last_name`             varchar(50)  DEFAULT NULL,
    `middle_name`           varchar(255) DEFAULT NULL,
    `personal_email`        varchar(255) DEFAULT NULL,
    `phone`                 varchar(15)  DEFAULT NULL,
    `termination_date`      date         DEFAULT NULL,
    `time_zone`             varchar(255) DEFAULT NULL,
    `work_hour_capacity`    int          DEFAULT NULL,
    `job_family_id`         bigint       DEFAULT NULL,
    `job_title_id`          bigint       DEFAULT NULL,
    PRIMARY KEY (`employee_id`),
    KEY `IDX_employee_job_family_id` (`job_family_id`),
    KEY `IDX_employee_job_title_id` (`job_title_id`),
    CONSTRAINT `FK_employee_job_family_job_family_id` FOREIGN KEY (`job_family_id`) REFERENCES `job_family` (`job_family_id`),
    CONSTRAINT `FK_employee_job_title_job_title_id` FOREIGN KEY (`job_title_id`) REFERENCES `job_title` (`job_title_id`),
    CONSTRAINT `FK_employee_user_employee_id` FOREIGN KEY (`employee_id`) REFERENCES `user` (`user_id`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `time_record`
(
    `time_record_id`     bigint NOT NULL AUTO_INCREMENT,
    `created_by`         varchar(255)                                                                  DEFAULT NULL,
    `created_date`       datetime(6)                                                                   DEFAULT NULL,
    `last_modified_by`   varchar(255)                                                                  DEFAULT NULL,
    `last_modified_date` datetime(6)                                                                   DEFAULT NULL,
    `break_hours`        float                                                                         DEFAULT NULL,
    `clock_in_time`      bigint                                                                        DEFAULT NULL,
    `clock_out_time`     bigint                                                                        DEFAULT NULL,
    `date`               date                                                                          DEFAULT NULL,
    `day_of_week`        enum ('FRIDAY','MONDAY','SATURDAY','SUNDAY','THURSDAY','TUESDAY','WEDNESDAY') DEFAULT NULL,
    `is_completed`       bit(1)                                                                        DEFAULT NULL,
    `is_manual`          bit(1)                                                                        DEFAULT NULL,
    `leave_hours`        float                                                                         DEFAULT NULL,
    `worked_hours`       float                                                                         DEFAULT NULL,
    `employee_id`        bigint                                                                        DEFAULT NULL,
    PRIMARY KEY (`time_record_id`),
    KEY `IDX_time_record_employee_id` (`employee_id`),
    CONSTRAINT `FK_time_record_employee_employee_id` FOREIGN KEY (`employee_id`) REFERENCES `employee` (`employee_id`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `time_slot`
(
    `time_slot_id`   bigint NOT NULL AUTO_INCREMENT,
    `end_time`       bigint       DEFAULT NULL,
    `is_active_now`  bit(1)       DEFAULT NULL,
    `is_manual`      bit(1)       DEFAULT NULL,
    `type`           varchar(255) DEFAULT NULL,
    `start_time`     bigint       DEFAULT NULL,
    `time_record_id` bigint       DEFAULT NULL,
    PRIMARY KEY (`time_slot_id`),
    KEY `IDX_time_slot_time_record_id` (`time_record_id`),
    CONSTRAINT `FK_time_slot_time_record_time_record_id` FOREIGN KEY (`time_record_id`) REFERENCES `time_record` (`time_record_id`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `time_request`
(
    `time_request_id`      bigint       NOT NULL AUTO_INCREMENT,
    `break_hours`          float       DEFAULT NULL,
    `created_date`         datetime(6)  NOT NULL,
    `initial_clock_in`     bigint      DEFAULT NULL,
    `initial_clock_out`    bigint      DEFAULT NULL,
    `request_type`         varchar(255) NOT NULL,
    `requested_end_time`   bigint      DEFAULT NULL,
    `requested_start_time` bigint      DEFAULT NULL,
    `reviewed_at`          datetime(6) DEFAULT NULL,
    `status`               varchar(255) NOT NULL,
    `work_hours`           float       DEFAULT NULL,
    `employee_id`          bigint       NOT NULL,
    `reviewer_id`          bigint      DEFAULT NULL,
    `time_record_id`       bigint      DEFAULT NULL,
    PRIMARY KEY (`time_request_id`),
    KEY `IDX_time_request_employee_id` (`employee_id`),
    KEY `IDX_time_request_time_record_id` (`time_record_id`),
    KEY `IDX_time_request_reviewer_id` (`reviewer_id`),
    CONSTRAINT `FK_time_request_employee_employee_id` FOREIGN KEY (`employee_id`) REFERENCES `employee` (`employee_id`),
    CONSTRAINT `FK_time_request_employee_reviewer_id` FOREIGN KEY (`reviewer_id`) REFERENCES `employee` (`employee_id`),
    CONSTRAINT `FK_time_request_time_record_time_record_id` FOREIGN KEY (`time_record_id`) REFERENCES `time_record` (`time_record_id`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `employee_education`
(
    `education_id`   bigint NOT NULL AUTO_INCREMENT,
    `degree`         varchar(255) DEFAULT NULL,
    `end_date`       date         DEFAULT NULL,
    `institution`    varchar(255) DEFAULT NULL,
    `specialization` varchar(255) DEFAULT NULL,
    `start_date`     date         DEFAULT NULL,
    `employee_id`    bigint NOT NULL,
    PRIMARY KEY (`education_id`),
    KEY `IDX_employee_education_employee_id` (`employee_id`),
    CONSTRAINT `FK_employee_education_employee_employee_id` FOREIGN KEY (`employee_id`) REFERENCES `employee` (`employee_id`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `employee_emergency`
(
    `emergency_id` bigint NOT NULL AUTO_INCREMENT,
    `contact_no`   varchar(15)  DEFAULT NULL,
    `relationship` varchar(255) DEFAULT NULL,
    `is_primary`   bit(1)       DEFAULT NULL,
    `name`         varchar(255) DEFAULT NULL,
    `employee_id`  bigint NOT NULL,
    PRIMARY KEY (`emergency_id`),
    KEY `IDX_employee_emergency_employee_id` (`employee_id`),
    CONSTRAINT `FK_employee_emergency_employee_employee_id` FOREIGN KEY (`employee_id`) REFERENCES `employee` (`employee_id`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `employee_family`
(
    `family_id`    bigint NOT NULL AUTO_INCREMENT,
    `birth_date`   date         DEFAULT NULL,
    `relationship` varchar(255) DEFAULT NULL,
    `first_name`   varchar(255) DEFAULT NULL,
    `gender`       varchar(255) DEFAULT NULL,
    `last_name`    varchar(255) DEFAULT NULL,
    `parent_name`  varchar(255) DEFAULT NULL,
    `employee_id`  bigint NOT NULL,
    PRIMARY KEY (`family_id`),
    KEY `IDX_employee_family_employee_id` (`employee_id`),
    CONSTRAINT `FK_employee_family_employee_employee_id` FOREIGN KEY (`employee_id`) REFERENCES `employee` (`employee_id`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `employee_manager`
(
    `id`                bigint NOT NULL AUTO_INCREMENT,
    `is_direct_manager` bit(1)       DEFAULT NULL,
    `manager_type`      varchar(255) DEFAULT NULL,
    `employee_id`       bigint       DEFAULT NULL,
    `manager_id`        bigint       DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `IDX_employee_manager_employee_id` (`employee_id`),
    KEY `IDX_employee_manager_manager_id` (`manager_id`),
    CONSTRAINT `FK_employee_manager_employee_employee_id` FOREIGN KEY (`employee_id`) REFERENCES `employee` (`employee_id`),
    CONSTRAINT `FK_employee_manager_employee_manager_id` FOREIGN KEY (`manager_id`) REFERENCES `employee` (`employee_id`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `employee_period`
(
    `id`          bigint NOT NULL AUTO_INCREMENT,
    `end_date`    date   DEFAULT NULL,
    `is_active`   bit(1) DEFAULT NULL,
    `start_date`  date   DEFAULT NULL,
    `employee_id` bigint DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `IDX_employee_period_employee_id` (`employee_id`),
    CONSTRAINT `FK_employee_period_employee_employee_id` FOREIGN KEY (`employee_id`) REFERENCES `employee` (`employee_id`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `employee_personal_info`
(
    `employee_id`                 bigint NOT NULL,
    `birth_date`                  date                                                                                                                                                                                                                                                                                                                                                                                     DEFAULT NULL,
    `blood_group`                 enum ('AB_NEGATIVE','AB_POSITIVE','A_NEGATIVE','A_POSITIVE','B_NEGATIVE','B_POSITIVE','O_NEGATIVE','O_POSITIVE')                                                                                                                                                                                                                                                                         DEFAULT NULL,
    `city`                        varchar(255)                                                                                                                                                                                                                                                                                                                                                                             DEFAULT NULL,
    `ethnicity`                   enum ('AFRICAN','ALASKAN_NATIVE','ARABIC','AUSTRALASIAN_OR_ABORIGINAL','CARIBBEAN','CHINESE','CUBAN','DECLINED_TO_RESPOND','EUROPEAN_OR_ANGLO_SAXON','FILIPINO','GUAMANIAN','INDIAN','JAPANESE','KOREAN','LATIN_AMERICAN','MELANESIAN','MEXICAN','MICRONESIAN','OTHER_ASIAN','OTHER_HISPANIC','OTHER_PACIFIC_ISLANDER','POLYNESIAN','PUERTO_RICAN','US_OR_CANADIAN_INDIAN','VIETNAMESE') DEFAULT NULL,
    `extra_info`                  json                                                                                                                                                                                                                                                                                                                                                                                     DEFAULT NULL,
    `marital_status`              enum ('DIVORCED','MARRIED','SINGLE','WIDOWED')                                                                                                                                                                                                                                                                                                                                           DEFAULT NULL,
    `nationality`                 varchar(255)                                                                                                                                                                                                                                                                                                                                                                             DEFAULT NULL,
    `nin`                         varchar(255)                                                                                                                                                                                                                                                                                                                                                                             DEFAULT NULL,
    `passport_no`                 varchar(255)                                                                                                                                                                                                                                                                                                                                                                             DEFAULT NULL,
    `postal_code`                 varchar(255)                                                                                                                                                                                                                                                                                                                                                                             DEFAULT NULL,
    `previous_employment_details` json                                                                                                                                                                                                                                                                                                                                                                                     DEFAULT NULL,
    `social_media_details`        json                                                                                                                                                                                                                                                                                                                                                                                     DEFAULT NULL,
    `ssn`                         varchar(255)                                                                                                                                                                                                                                                                                                                                                                             DEFAULT NULL,
    `state`                       varchar(255)                                                                                                                                                                                                                                                                                                                                                                             DEFAULT NULL,
    PRIMARY KEY (`employee_id`),
    CONSTRAINT `FK_employee_personal_info_employee_employee_id` FOREIGN KEY (`employee_id`) REFERENCES `employee` (`employee_id`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `employee_progression`
(
    `progression_id` bigint NOT NULL AUTO_INCREMENT,
    `employee_type`  varchar(255) DEFAULT NULL,
    `end_date`       date         DEFAULT NULL,
    `is_current`     bit(1)       DEFAULT NULL,
    `start_date`     date         DEFAULT NULL,
    `employee_id`    bigint NOT NULL,
    `job_family_id`  bigint NOT NULL,
    `job_title_id`   bigint NOT NULL,
    PRIMARY KEY (`progression_id`),
    KEY `IDX_employee_progression_job_title_id` (`job_title_id`),
    KEY `IDX_employee_progression_employee_id` (`employee_id`),
    KEY `IDX_employee_progression_job_family_id` (`job_family_id`),
    CONSTRAINT `FK_employee_progression_employee_employee_id` FOREIGN KEY (`employee_id`) REFERENCES `employee` (`employee_id`),
    CONSTRAINT `FK_employee_progression_job_family_job_family_id` FOREIGN KEY (`job_family_id`) REFERENCES `job_family` (`job_family_id`),
    CONSTRAINT `FK_employee_progression_job_title_job_title_id` FOREIGN KEY (`job_title_id`) REFERENCES `job_title` (`job_title_id`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `employee_role`
(
    `employee_id`             bigint NOT NULL,
    `attendance_role`         varchar(255) DEFAULT NULL,
    `permission_changed_date` date         DEFAULT NULL,
    `is_super_admin`          bit(1) NOT NULL,
    `leave_role`              varchar(255) DEFAULT NULL,
    `people_role`             varchar(255) DEFAULT NULL,
    `role_changed_by`         bigint       DEFAULT NULL,
    PRIMARY KEY (`employee_id`),
    KEY `IDX_employee_role_role_changed_by` (`role_changed_by`),
    CONSTRAINT `FK_employee_role_employee_employee_id` FOREIGN KEY (`employee_id`) REFERENCES `employee` (`employee_id`),
    CONSTRAINT `FK_employee_role_employee_role_changed_by` FOREIGN KEY (`role_changed_by`) REFERENCES `employee` (`employee_id`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `employee_team`
(
    `id`            bigint NOT NULL AUTO_INCREMENT,
    `is_supervisor` bit(1) NOT NULL,
    `employee_id`   bigint DEFAULT NULL,
    `team_id`       bigint DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `IDX_employee_team_employee_id` (`employee_id`),
    KEY `IDX_employee_team_team_id` (`team_id`),
    CONSTRAINT `FK_employee_team_employee_employee_id` FOREIGN KEY (`employee_id`) REFERENCES `employee` (`employee_id`),
    CONSTRAINT `FK_employee_team_team_team_id` FOREIGN KEY (`team_id`) REFERENCES `team` (`team_id`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `employee_timeline`
(
    `timeline_id`        bigint NOT NULL AUTO_INCREMENT,
    `created_by`         varchar(255) DEFAULT NULL,
    `created_date`       datetime(6)  DEFAULT NULL,
    `last_modified_by`   varchar(255) DEFAULT NULL,
    `last_modified_date` datetime(6)  DEFAULT NULL,
    `display_date`       date         DEFAULT NULL,
    `new_value`          varchar(255) DEFAULT NULL,
    `previous_value`     varchar(255) DEFAULT NULL,
    `timeline_type`      varchar(255) DEFAULT NULL,
    `title`              varchar(255) DEFAULT NULL,
    `employee_id`        bigint       DEFAULT NULL,
    PRIMARY KEY (`timeline_id`),
    KEY `IDX_employee_timeline_employee_id` (`employee_id`),
    CONSTRAINT `FK_employee_timeline_employee_employee_id` FOREIGN KEY (`employee_id`) REFERENCES `employee` (`employee_id`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `employee_visa`
(
    `visa_id`         bigint NOT NULL AUTO_INCREMENT,
    `expiration_date` date         DEFAULT NULL,
    `issued_date`     date         DEFAULT NULL,
    `issuing_country` varchar(255) DEFAULT NULL,
    `visa_type`       varchar(255) DEFAULT NULL,
    `employee_id`     bigint NOT NULL,
    PRIMARY KEY (`visa_id`),
    KEY `IDX_employee_visa_employee_id` (`employee_id`),
    CONSTRAINT `FK_employee_visa_employee_employee_id` FOREIGN KEY (`employee_id`) REFERENCES `employee` (`employee_id`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `holiday`
(
    `id`                 bigint       NOT NULL AUTO_INCREMENT,
    `created_by`         varchar(255) DEFAULT NULL,
    `created_date`       datetime(6)  DEFAULT NULL,
    `last_modified_by`   varchar(255) DEFAULT NULL,
    `last_modified_date` datetime(6)  DEFAULT NULL,
    `date`               date         NOT NULL,
    `holiday_duration`   varchar(255) NOT NULL,
    `is_active`          bit(1)       DEFAULT NULL,
    `name`               varchar(50)  NOT NULL,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `job_family_title`
(
    `job_family_id` bigint NOT NULL,
    `job_title_id`  bigint NOT NULL,
    PRIMARY KEY (`job_family_id`, `job_title_id`),
    KEY `IDX_job_family_title_job_title_id` (`job_title_id`),
    CONSTRAINT `FK_job_family_title_job_family_job_family_id` FOREIGN KEY (`job_family_id`) REFERENCES `job_family` (`job_family_id`),
    CONSTRAINT `FK_job_family_title_job_title_job_title_id` FOREIGN KEY (`job_title_id`) REFERENCES `job_title` (`job_title_id`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `leave_entitlement`
(
    `entitlement_id`       bigint NOT NULL AUTO_INCREMENT,
    `created_by`           varchar(255) DEFAULT NULL,
    `created_date`         datetime(6)  DEFAULT NULL,
    `last_modified_by`     varchar(255) DEFAULT NULL,
    `last_modified_date`   datetime(6)  DEFAULT NULL,
    `is_active`            bit(1) NOT NULL,
    `is_manual`            bit(1) NOT NULL,
    `is_override`          bit(1) NOT NULL,
    `reason`               varchar(40)  DEFAULT NULL,
    `total_days_allocated` float  NOT NULL,
    `total_days_used`      float  NOT NULL,
    `valid_from`           date   NOT NULL,
    `valid_to`             date   NOT NULL,
    `employee_id`          bigint NOT NULL,
    `leave_type_id`        bigint NOT NULL,
    PRIMARY KEY (`entitlement_id`),
    KEY `IDX_leave_entitlement_employee_id` (`employee_id`),
    KEY `IDX_leave_entitlement_leave_type_id` (`leave_type_id`),
    CONSTRAINT `FK_leave_entitlement_employee_employee_id` FOREIGN KEY (`employee_id`) REFERENCES `employee` (`employee_id`),
    CONSTRAINT `FK_leave_entitlement_leave_type_type_id` FOREIGN KEY (`leave_type_id`) REFERENCES `leave_type` (`type_id`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `leave_request`
(
    `leave_req_id`       bigint       NOT NULL AUTO_INCREMENT,
    `created_by`         varchar(255) DEFAULT NULL,
    `created_date`       datetime(6)  DEFAULT NULL,
    `last_modified_by`   varchar(255) DEFAULT NULL,
    `last_modified_date` datetime(6)  DEFAULT NULL,
    `duration_days`      float        DEFAULT NULL,
    `end_date`           date         NOT NULL,
    `event_id`           varchar(255) DEFAULT NULL,
    `is_auto_approved`   bit(1)       DEFAULT NULL,
    `is_viewed`          bit(1)       DEFAULT NULL,
    `leave_state`        varchar(255) NOT NULL,
    `description`        varchar(255) DEFAULT NULL,
    `reviewed_date`      datetime(6)  DEFAULT NULL,
    `reviewer_comment`   varchar(255) DEFAULT NULL,
    `start_date`         date         NOT NULL,
    `status`             varchar(255) NOT NULL,
    `employee_id`        bigint       NOT NULL,
    `type_id`            bigint       NOT NULL,
    `reviewer_id`        bigint       DEFAULT NULL,
    PRIMARY KEY (`leave_req_id`),
    KEY `IDX_leave_request_reviewer_id` (`reviewer_id`),
    KEY `IDX_leave_request_type_id` (`type_id`),
    KEY `IDX_leave_request_employee_id` (`employee_id`),
    CONSTRAINT `FK_leave_request_employee_employee_id` FOREIGN KEY (`employee_id`) REFERENCES `employee` (`employee_id`),
    CONSTRAINT `FK_leave_request_employee_reviewer_id` FOREIGN KEY (`reviewer_id`) REFERENCES `employee` (`employee_id`),
    CONSTRAINT `FK_leave_request_leave_type_type_id` FOREIGN KEY (`type_id`) REFERENCES `leave_type` (`type_id`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `leave_request_attachment`
(
    `attachment_id`      bigint NOT NULL AUTO_INCREMENT,
    `cognito_file_name`  varchar(255) DEFAULT NULL,
    `original_file_name` varchar(255) DEFAULT NULL,
    `file_url`           varchar(255) DEFAULT NULL,
    `leave_request_id`   bigint NOT NULL,
    PRIMARY KEY (`attachment_id`),
    KEY `IDX_leave_request_attachment_leave_request_id` (`leave_request_id`),
    CONSTRAINT `FK_leave_request_attachment_leave_request_leave_req_id` FOREIGN KEY (`leave_request_id`) REFERENCES `leave_request` (`leave_req_id`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `leave_request_entitlement`
(
    `id`                   bigint NOT NULL AUTO_INCREMENT,
    `days_used`            float  NOT NULL,
    `leave_entitlement_id` bigint DEFAULT NULL,
    `leave_request_id`     bigint DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `IDX_leave_request_entitlement_leave_entitlement_id` (`leave_entitlement_id`),
    KEY `IDX_leave_request_entitlement_leave_request_id` (`leave_request_id`),
    CONSTRAINT `FK_leave_request_entitlement_leave_entitlement_entitlement_id` FOREIGN KEY (`leave_entitlement_id`) REFERENCES `leave_entitlement` (`entitlement_id`),
    CONSTRAINT `FK_leave_request_entitlement_leave_request_leave_req_id` FOREIGN KEY (`leave_request_id`) REFERENCES `leave_request` (`leave_req_id`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `notification`
(
    `id`                 bigint NOT NULL AUTO_INCREMENT,
    `created_by`         varchar(255) DEFAULT NULL,
    `created_date`       datetime(6)  DEFAULT NULL,
    `last_modified_by`   varchar(255) DEFAULT NULL,
    `last_modified_date` datetime(6)  DEFAULT NULL,
    `body`               varchar(255) DEFAULT NULL,
    `is_viewed`          bit(1)       DEFAULT NULL,
    `notification_type`  varchar(255) DEFAULT NULL,
    `resource_id`        varchar(255) DEFAULT NULL,
    `employee_id`        bigint       DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `IDX_notification_employee_id` (`employee_id`),
    CONSTRAINT `FK_notification_employee_employee_id` FOREIGN KEY (`employee_id`) REFERENCES `employee` (`employee_id`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `type_rule`
(
    `rule_id`              bigint       NOT NULL AUTO_INCREMENT,
    `each_year_applicable` bit(1)       DEFAULT NULL,
    `gain_eligible_type`   varchar(255) NOT NULL,
    `is_active`            bit(1)       DEFAULT NULL,
    `rule_category`        varchar(255) NOT NULL,
    `employee_type`        varchar(255) NOT NULL,
    `lose_eligible_type`   varchar(255) NOT NULL,
    `name`                 varchar(255) DEFAULT NULL,
    `valid_from`           date         DEFAULT NULL,
    `type_id`              bigint       NOT NULL,
    PRIMARY KEY (`rule_id`),
    UNIQUE KEY `UK_type_rule_name` (`name`),
    KEY `IDX_type_rule_type_id` (`type_id`),
    CONSTRAINT `FK_type_rule_leave_type_type_id` FOREIGN KEY (`type_id`) REFERENCES `leave_type` (`type_id`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `rule_property`
(
    `prop_id`       bigint       NOT NULL AUTO_INCREMENT,
    `earn_grid`     json DEFAULT NULL,
    `earn_method`   varchar(255) NOT NULL,
    `num_days`      int  DEFAULT NULL,
    `property_type` varchar(255) NOT NULL,
    `rule_id`       bigint       NOT NULL,
    PRIMARY KEY (`prop_id`),
    KEY `IDX_rule_property_rule_id` (`rule_id`),
    CONSTRAINT `FK_rule_property_type_rule_rule_id` FOREIGN KEY (`rule_id`) REFERENCES `type_rule` (`rule_id`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `user_settings`
(
    `user_id`       bigint NOT NULL,
    `notifications` json DEFAULT NULL,
    PRIMARY KEY (`user_id`),
    CONSTRAINT `FK_user_settings_user_user_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `carry_forward_info`
(
    `info_id`            bigint NOT NULL AUTO_INCREMENT,
    `created_by`         varchar(255) DEFAULT NULL,
    `created_date`       datetime(6)  DEFAULT NULL,
    `last_modified_by`   varchar(255) DEFAULT NULL,
    `last_modified_date` datetime(6)  DEFAULT NULL,
    `cycle_end_date`     date         DEFAULT NULL,
    `days`               float        DEFAULT NULL,
    `employee_id`        bigint NOT NULL,
    `leave_type_id`      bigint NOT NULL,
    PRIMARY KEY (`info_id`),
    KEY `IDX_carry_forward_info_employee_id` (`employee_id`),
    KEY `IDX_carry_forward_info_leave_type_id` (`leave_type_id`),
    CONSTRAINT `FK_carry_forward_info_employee_employee_id` FOREIGN KEY (`employee_id`) REFERENCES `employee` (`employee_id`),
    CONSTRAINT `FK_carry_forward_info_leave_type_type_id` FOREIGN KEY (`leave_type_id`) REFERENCES `leave_type` (`type_id`)
) ENGINE = InnoDB;

-- rollback drop table carry_forward_info;
-- rollback drop table user_settings;
-- rollback drop table rule_property;
-- rollback drop table type_rule;
-- rollback drop table notification;
-- rollback drop table leave_request_entitlement;
-- rollback drop table leave_request_attachment;
-- rollback drop table leave_request;
-- rollback drop table leave_entitlement;
-- rollback drop table job_family_title;
-- rollback drop table holiday;
-- rollback drop table employee_visa;
-- rollback drop table employee_timeline;
-- rollback drop table employee_team;
-- rollback drop table employee_role;
-- rollback drop table employee_progression;
-- rollback drop table employee_personal_info;
-- rollback drop table employee_period;
-- rollback drop table employee_manager;
-- rollback drop table employee_family;
-- rollback drop table employee_emergency;
-- rollback drop table employee_education;
-- rollback drop table time_request;
-- rollback drop table time_slot;
-- rollback drop table time_record;
-- rollback drop table employee;
-- rollback drop table time_config;
-- rollback drop table module_role_restriction;
-- rollback drop table organization_config;
-- rollback drop table attendance_config;
-- rollback drop table leave_type;
-- rollback drop table team;
-- rollback drop table job_title;
-- rollback drop table job_family;
-- rollback drop table organization;
-- rollback drop table user;

-- changeset AkilaSachintha:common-ddl-script-v1-create-crm-tables
CREATE TABLE IF NOT EXISTS `crm_priority`
(
    `id`          bigint NOT NULL AUTO_INCREMENT,
    `name`        text   NOT NULL,
    `order_index` int DEFAULT NULL,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `crm_task_type`
(
    `id`          bigint NOT NULL AUTO_INCREMENT,
    `name`        text   NOT NULL,
    `order_index` int DEFAULT NULL,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `crm_company`
(
    `id`                 bigint  NOT NULL AUTO_INCREMENT,
    `created_by`         text             DEFAULT NULL,
    `created_date`       datetime(6)      DEFAULT NULL,
    `last_modified_by`   text             DEFAULT NULL,
    `last_modified_date` datetime(6)      DEFAULT NULL,
    `name`               text    NOT NULL,
    `industry`           text             DEFAULT NULL,
    `website`            text             DEFAULT NULL,
    `address`            text             DEFAULT NULL,
    `contact_number`     text             DEFAULT NULL,
    `is_deleted`         boolean NOT NULL DEFAULT FALSE,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `crm_contact`
(
    `id`                 bigint  NOT NULL AUTO_INCREMENT,
    `created_by`         text             DEFAULT NULL,
    `created_date`       datetime(6)      DEFAULT NULL,
    `last_modified_by`   text             DEFAULT NULL,
    `last_modified_date` datetime(6)      DEFAULT NULL,
    `name`               text    NOT NULL,
    `email`              text    NOT NULL,
    `contact_number`     text             DEFAULT NULL,
    `last_contact_at`    datetime(6)      DEFAULT NULL,
    `company_id`         bigint           DEFAULT NULL,
    `owner_id`           bigint  NOT NULL,
    `is_deleted`         boolean NOT NULL DEFAULT FALSE,
    PRIMARY KEY (`id`),
    CONSTRAINT `FK_crm_contact_crm_company_company_id` FOREIGN KEY (`company_id`) REFERENCES `crm_company` (`id`),
    CONSTRAINT `FK_crm_contact_employee_owner_id` FOREIGN KEY (`owner_id`) REFERENCES `employee` (`employee_id`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `crm_deal_stage`
(
    `id`                 bigint  NOT NULL AUTO_INCREMENT,
    `created_by`         text             DEFAULT NULL,
    `created_date`       datetime(6)      DEFAULT NULL,
    `last_modified_by`   text             DEFAULT NULL,
    `last_modified_date` datetime(6)      DEFAULT NULL,
    `name`               text    NOT NULL,
    `description`        text             DEFAULT NULL,
    `color`              text    NOT NULL,
    `order_index`        int     NOT NULL,
    `stage_type`         text    NOT NULL,
    `is_deleted`         boolean NOT NULL DEFAULT FALSE,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `crm_deal`
(
    `id`                 bigint  NOT NULL AUTO_INCREMENT,
    `created_by`         text             DEFAULT NULL,
    `created_date`       datetime(6)      DEFAULT NULL,
    `last_modified_by`   text             DEFAULT NULL,
    `last_modified_date` datetime(6)      DEFAULT NULL,
    `name`               text    NOT NULL,
    `description`        text             DEFAULT NULL,
    `stage_id`           bigint  NOT NULL,
    `priority_id`        bigint           DEFAULT NULL,
    `closing_at`         datetime(6)      DEFAULT NULL,
    `amount`             text             DEFAULT NULL,
    `company_id`         bigint           DEFAULT NULL,
    `contact_id`         bigint  NOT NULL,
    `owner_id`           bigint  NOT NULL,
    `is_deleted`         boolean NOT NULL DEFAULT FALSE,
    PRIMARY KEY (`id`),
    CONSTRAINT `FK_crm_deal_crm_deal_stage_stage_id` FOREIGN KEY (`stage_id`) REFERENCES `crm_deal_stage` (`id`),
    CONSTRAINT `FK_crm_deal_crm_priority_priority_id` FOREIGN KEY (`priority_id`) REFERENCES `crm_priority` (`id`),
    CONSTRAINT `FK_crm_deal_crm_company_company_id` FOREIGN KEY (`company_id`) REFERENCES `crm_company` (`id`),
    CONSTRAINT `FK_crm_deal_crm_contact_contact_id` FOREIGN KEY (`contact_id`) REFERENCES `crm_contact` (`id`),
    CONSTRAINT `FK_crm_deal_employee_owner_id` FOREIGN KEY (`owner_id`) REFERENCES `employee` (`employee_id`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `crm_task`
(
    `id`                 bigint  NOT NULL AUTO_INCREMENT,
    `created_by`         text             DEFAULT NULL,
    `created_date`       datetime(6)      DEFAULT NULL,
    `last_modified_by`   text             DEFAULT NULL,
    `last_modified_date` datetime(6)      DEFAULT NULL,
    `name`               text    NOT NULL,
    `type_id`            bigint  NOT NULL,
    `priority_id`        bigint  NOT NULL,
    `is_completed`       boolean NOT NULL DEFAULT FALSE,
    `due_at`             datetime(6)      DEFAULT NULL,
    `notes`              text             DEFAULT NULL,
    `owner_id`           bigint  NOT NULL,
    `contact_id`         bigint           DEFAULT NULL,
    `company_id`         bigint           DEFAULT NULL,
    `deal_id`            bigint           DEFAULT NULL,
    `is_deleted`         boolean NOT NULL DEFAULT FALSE,
    PRIMARY KEY (`id`),
    CONSTRAINT `FK_crm_task_crm_task_type_type_id` FOREIGN KEY (`type_id`) REFERENCES `crm_task_type` (`id`),
    CONSTRAINT `FK_crm_task_crm_priority_priority_id` FOREIGN KEY (`priority_id`) REFERENCES `crm_priority` (`id`),
    CONSTRAINT `FK_crm_task_employee_owner_id` FOREIGN KEY (`owner_id`) REFERENCES `employee` (`employee_id`),
    CONSTRAINT `FK_crm_task_crm_contact_contact_id` FOREIGN KEY (`contact_id`) REFERENCES `crm_contact` (`id`),
    CONSTRAINT `FK_crm_task_crm_company_company_id` FOREIGN KEY (`company_id`) REFERENCES `crm_company` (`id`),
    CONSTRAINT `FK_crm_task_crm_deal_deal_id` FOREIGN KEY (`deal_id`) REFERENCES `crm_deal` (`id`)
) ENGINE = InnoDB;

-- rollback drop table crm_task;
-- rollback drop table crm_deal;
-- rollback drop table crm_deal_stage;
-- rollback drop table crm_contact;
-- rollback drop table crm_company;
-- rollback drop table crm_task_type;
-- rollback drop table crm_priority;

-- changeset anusham:crm-ddl-script-v1-create-table-crm-config
CREATE TABLE IF NOT EXISTS `crm_config`
(
    `id`                 bigint NOT NULL AUTO_INCREMENT,
    `currency`           text   NOT NULL,
    `created_by`         text        DEFAULT NULL,
    `created_date`       datetime(6) DEFAULT NULL,
    `last_modified_by`   text        DEFAULT NULL,
    `last_modified_date` datetime(6) DEFAULT NULL,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB;

-- rollback DROP TABLE IF EXISTS `crm_config`;

