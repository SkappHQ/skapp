-- liquibase formatted sql

-- changeset AkilaSilva:people-ddl-script-v1-create-table-com-work-location
CREATE TABLE IF NOT EXISTS `com_work_location`
(
    `id`                 bigint      NOT NULL AUTO_INCREMENT,
    `name`               text        NOT NULL,
    `address`            text                 DEFAULT NULL,
    `created_by`         text                 DEFAULT NULL,
    `created_date`       datetime(6)          DEFAULT NULL,
    `last_modified_by`   text                 DEFAULT NULL,
    `last_modified_date` datetime(6)          DEFAULT NULL,
    PRIMARY KEY (`id`)
);

-- rollback DROP TABLE `com_work_location`;
