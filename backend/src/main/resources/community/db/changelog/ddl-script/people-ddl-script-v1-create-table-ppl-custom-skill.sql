-- liquibase formatted sql

-- changeset shakila:00116_create_table_ppl_custom_skill
CREATE TABLE IF NOT EXISTS `ppl_custom_skill`
(
    `id`   bigint       NOT NULL AUTO_INCREMENT,
    `name` text         NOT NULL,
    `created_by`         text        DEFAULT NULL,
    `created_date`       datetime(6) DEFAULT NULL,
    `last_modified_by`   text        DEFAULT NULL,
    `last_modified_date` datetime(6) DEFAULT NULL,
    CONSTRAINT `PK_ppl_custom_skill` PRIMARY KEY (`id`)
);

-- rollback DROP TABLE IF EXISTS `ppl_custom_skill`;
