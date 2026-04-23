-- liquibase formatted sql

-- changeset anusham:common-ddl-script-v1-create-table-crm-deal-stage
CREATE TABLE IF NOT EXISTS `crm_deal_stage` (
    `id`                 bigint       NOT NULL AUTO_INCREMENT,
    `template_id`        bigint       NOT NULL,
    `name`               varchar(255) NOT NULL,
    `color`              varchar(50)  NOT NULL,
    `order_index`        int          NOT NULL,
    `is_deleted`         boolean      NOT NULL DEFAULT FALSE,
    `created_by`         varchar(255) DEFAULT NULL,
    `created_date`       datetime(6)  DEFAULT NULL,
    `last_modified_by`   varchar(255) DEFAULT NULL,
    `last_modified_date` datetime(6)  DEFAULT NULL,
    PRIMARY KEY (`id`),
    CONSTRAINT `FK_crm_deal_stage_crm_pipeline_template_template_id`
        FOREIGN KEY (`template_id`) REFERENCES `crm_pipeline_template` (`id`)
);

-- rollback DROP TABLE IF EXISTS `crm_deal_stage`;