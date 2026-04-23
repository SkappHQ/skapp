-- liquibase formatted sql

-- changeset anusham:common-ddl-script-v1-create-table-crm-deal
CREATE TABLE IF NOT EXISTS `crm_deal` (
    `id`                 bigint        NOT NULL AUTO_INCREMENT,
    `name`               varchar(255)  NOT NULL,
    `stage_id`           bigint        NOT NULL,
    `sale_state_id`      bigint        DEFAULT NULL,
    `closing_date`       datetime(6)   DEFAULT NULL,
    `amount`             decimal(19,4) DEFAULT NULL,
    `currency_code`      char(3)       DEFAULT NULL,
    `company_id`         bigint        DEFAULT NULL,
    `contact_id`         bigint        NOT NULL,
    `owner_id`           bigint        NOT NULL,
    `is_deleted`         boolean       NOT NULL DEFAULT FALSE,
    `created_by`         varchar(255)  DEFAULT NULL,
    `created_date`       datetime(6)   DEFAULT NULL,
    `last_modified_by`   varchar(255)  DEFAULT NULL,
    `last_modified_date` datetime(6)   DEFAULT NULL,
    PRIMARY KEY (`id`),
    CONSTRAINT `FK_crm_deal_crm_deal_stage_stage_id`
        FOREIGN KEY (`stage_id`) REFERENCES `crm_deal_stage` (`id`),
    CONSTRAINT `FK_crm_deal_crm_sale_state_sale_state_id`
        FOREIGN KEY (`sale_state_id`) REFERENCES `crm_sale_state` (`id`),
    CONSTRAINT `FK_crm_deal_crm_company_company_id`
        FOREIGN KEY (`company_id`) REFERENCES `crm_company` (`id`),
    CONSTRAINT `FK_crm_deal_crm_contact_contact_id`
        FOREIGN KEY (`contact_id`) REFERENCES `crm_contact` (`id`),
    CONSTRAINT `FK_crm_deal_employee_owner_id`
        FOREIGN KEY (`owner_id`) REFERENCES `employee` (`employee_id`)
);

-- rollback DROP TABLE IF EXISTS `crm_deal`;