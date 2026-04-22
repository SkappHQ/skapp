-- liquibase formatted sql

-- changeset copilot:common-ddl-script-v1-add-crm-module-flag
ALTER TABLE `module_config`
    ADD COLUMN `crm_module` bit(1) DEFAULT b'1';

ALTER TABLE `employee_role`
    ADD COLUMN `crm_role` varchar(50) DEFAULT 'CRM_SALES_REP';

-- rollback ALTER TABLE `module_config` DROP COLUMN `crm_module`;
-- rollback ALTER TABLE `employee_role` DROP COLUMN `crm_role`;

-- changeset copilot:common-ddl-script-v1-create-crm-tables
CREATE TABLE IF NOT EXISTS `crm_task_stage`
(
    `id`   bigint       NOT NULL AUTO_INCREMENT,
    `name` varchar(255) NOT NULL,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `crm_task_status`
(
    `id`   bigint       NOT NULL AUTO_INCREMENT,
    `name` varchar(255) NOT NULL,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `crm_task_type`
(
    `id`   bigint       NOT NULL AUTO_INCREMENT,
    `name` varchar(255) NOT NULL,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `crm_sale_state`
(
    `id`    bigint       NOT NULL AUTO_INCREMENT,
    `name`  varchar(255) NOT NULL,
    `color` varchar(50)  DEFAULT NULL,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `crm_pipeline_template`
(
    `id`          bigint       NOT NULL AUTO_INCREMENT,
    `name`        varchar(255) NOT NULL,
    `description` text,
    `is_active`   bit(1) DEFAULT b'1',
    PRIMARY KEY (`id`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `crm_deal_stage`
(
    `id`          bigint       NOT NULL AUTO_INCREMENT,
    `template_id` bigint       NOT NULL,
    `name`        varchar(255) NOT NULL,
    `color`       varchar(50)  NOT NULL,
    `order_index` bigint       NOT NULL,
    `is_active`   bit(1) DEFAULT b'1',
    PRIMARY KEY (`id`),
    KEY `IDX_crm_deal_stage_template_id` (`template_id`),
    CONSTRAINT `FK_crm_deal_stage_template` FOREIGN KEY (`template_id`) REFERENCES `crm_pipeline_template` (`id`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `crm_company`
(
    `id`              bigint       NOT NULL AUTO_INCREMENT,
    `name`            varchar(255) NOT NULL,
    `industry`        varchar(255) DEFAULT NULL,
    `website`         varchar(255) DEFAULT NULL,
    `address`         varchar(255) DEFAULT NULL,
    `company_contact` varchar(255) DEFAULT NULL,
    `is_active`       bit(1) DEFAULT b'1',
    PRIMARY KEY (`id`),
    UNIQUE KEY `UK_crm_company_name` (`name`),
    UNIQUE KEY `UK_crm_company_website` (`website`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `crm_contact`
(
    `id`             bigint       NOT NULL AUTO_INCREMENT,
    `name`           varchar(255) NOT NULL,
    `email`          varchar(255) NOT NULL,
    `contact_number` varchar(50)  DEFAULT NULL,
    `company_id`     bigint       DEFAULT NULL,
    `owner_id`       bigint       NOT NULL,
    `is_active`      bit(1) DEFAULT b'1',
    PRIMARY KEY (`id`),
    KEY `IDX_crm_contact_company_id` (`company_id`),
    KEY `IDX_crm_contact_owner_id` (`owner_id`),
    CONSTRAINT `FK_crm_contact_company` FOREIGN KEY (`company_id`) REFERENCES `crm_company` (`id`),
    CONSTRAINT `FK_crm_contact_owner` FOREIGN KEY (`owner_id`) REFERENCES `employee` (`employee_id`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `crm_deal`
(
    `id`            bigint       NOT NULL AUTO_INCREMENT,
    `name`          varchar(255) NOT NULL,
    `stage_id`      bigint       NOT NULL,
    `sale_state_id` bigint       DEFAULT NULL,
    `closing_date`  date         DEFAULT NULL,
    `company_id`    bigint       DEFAULT NULL,
    `contact_id`    bigint       NOT NULL,
    `owner_id`      bigint       NOT NULL,
    `is_active`     bit(1) DEFAULT b'1',
    PRIMARY KEY (`id`),
    KEY `IDX_crm_deal_stage_id` (`stage_id`),
    KEY `IDX_crm_deal_sale_state_id` (`sale_state_id`),
    KEY `IDX_crm_deal_company_id` (`company_id`),
    KEY `IDX_crm_deal_contact_id` (`contact_id`),
    KEY `IDX_crm_deal_owner_id` (`owner_id`),
    CONSTRAINT `FK_crm_deal_stage` FOREIGN KEY (`stage_id`) REFERENCES `crm_deal_stage` (`id`),
    CONSTRAINT `FK_crm_deal_sale_state` FOREIGN KEY (`sale_state_id`) REFERENCES `crm_sale_state` (`id`),
    CONSTRAINT `FK_crm_deal_company` FOREIGN KEY (`company_id`) REFERENCES `crm_company` (`id`),
    CONSTRAINT `FK_crm_deal_contact` FOREIGN KEY (`contact_id`) REFERENCES `crm_contact` (`id`),
    CONSTRAINT `FK_crm_deal_owner` FOREIGN KEY (`owner_id`) REFERENCES `employee` (`employee_id`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `crm_task`
(
    `id`           bigint       NOT NULL AUTO_INCREMENT,
    `name`         varchar(255) NOT NULL,
    `type_id`      bigint       NOT NULL,
    `priority`     varchar(50)  NOT NULL,
    `stage_id`     bigint       NOT NULL,
    `status_id`    bigint       NOT NULL,
    `closing_date` timestamp    DEFAULT NULL,
    `notes`        text,
    `owner_id`     bigint       NOT NULL,
    `contact_id`   bigint       DEFAULT NULL,
    `company_id`   bigint       DEFAULT NULL,
    `deal_id`      bigint       DEFAULT NULL,
    `is_active`    bit(1) DEFAULT b'1',
    PRIMARY KEY (`id`),
    KEY `IDX_crm_task_type_id` (`type_id`),
    KEY `IDX_crm_task_stage_id` (`stage_id`),
    KEY `IDX_crm_task_status_id` (`status_id`),
    KEY `IDX_crm_task_owner_id` (`owner_id`),
    KEY `IDX_crm_task_contact_id` (`contact_id`),
    KEY `IDX_crm_task_company_id` (`company_id`),
    KEY `IDX_crm_task_deal_id` (`deal_id`),
    CONSTRAINT `FK_crm_task_type` FOREIGN KEY (`type_id`) REFERENCES `crm_task_type` (`id`),
    CONSTRAINT `FK_crm_task_stage` FOREIGN KEY (`stage_id`) REFERENCES `crm_task_stage` (`id`),
    CONSTRAINT `FK_crm_task_status` FOREIGN KEY (`status_id`) REFERENCES `crm_task_status` (`id`),
    CONSTRAINT `FK_crm_task_owner` FOREIGN KEY (`owner_id`) REFERENCES `employee` (`employee_id`),
    CONSTRAINT `FK_crm_task_contact` FOREIGN KEY (`contact_id`) REFERENCES `crm_contact` (`id`),
    CONSTRAINT `FK_crm_task_company` FOREIGN KEY (`company_id`) REFERENCES `crm_company` (`id`),
    CONSTRAINT `FK_crm_task_deal` FOREIGN KEY (`deal_id`) REFERENCES `crm_deal` (`id`)
) ENGINE = InnoDB;

-- rollback drop table crm_task;
-- rollback drop table crm_deal;
-- rollback drop table crm_contact;
-- rollback drop table crm_company;
-- rollback drop table crm_deal_stage;
-- rollback drop table crm_pipeline_template;
-- rollback drop table crm_sale_state;
-- rollback drop table crm_task_type;
-- rollback drop table crm_task_status;
-- rollback drop table crm_task_stage;
