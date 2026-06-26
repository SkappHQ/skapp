-- liquibase formatted sql

-- changeset AkilaSilva:common-ddl-script-v1-create-table-system-version
CREATE TABLE IF NOT EXISTS `system_version`
(
    `version`            VARCHAR(255) NOT NULL,
    `reason`             VARCHAR(255) NOT NULL,
    `created_by`         varchar(255) DEFAULT NULL,
    `created_date`       datetime(6)  DEFAULT NULL,
    `last_modified_by`   varchar(255) DEFAULT NULL,
    `last_modified_date` datetime(6)  DEFAULT NULL,
    PRIMARY KEY (`version`)
) ENGINE = InnoDB;

-- rollback DROP TABLE `system_version`;
