-- liquibase formatted sql

-- changeset AkilaSilva:common-ddl-script-v1-create-table-user-version
CREATE TABLE IF NOT EXISTS `user_version`
(
    `user_id`            BIGINT       NOT NULL,
    `version`            VARCHAR(255) NOT NULL,
    `created_by`         varchar(255) DEFAULT NULL,
    `created_date`       datetime(6)  DEFAULT NULL,
    `last_modified_by`   varchar(255) DEFAULT NULL,
    `last_modified_date` datetime(6)  DEFAULT NULL,
    PRIMARY KEY (`user_id`)
) ENGINE = InnoDB;

-- rollback DROP TABLE `user_version`;
