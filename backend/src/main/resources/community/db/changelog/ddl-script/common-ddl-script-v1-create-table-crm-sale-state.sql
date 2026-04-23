-- liquibase formatted sql

-- changeset anusham:common-ddl-script-v1-create-table-crm-sale-state
CREATE TABLE IF NOT EXISTS `crm_sale_state` (
    `id`          bigint       NOT NULL AUTO_INCREMENT,
    `name`        varchar(255) NOT NULL,
    `order_index` int          DEFAULT NULL,
    `color`       varchar(50)  DEFAULT NULL,
    PRIMARY KEY (`id`)
);

-- rollback DROP TABLE IF EXISTS `crm_sale_state`;