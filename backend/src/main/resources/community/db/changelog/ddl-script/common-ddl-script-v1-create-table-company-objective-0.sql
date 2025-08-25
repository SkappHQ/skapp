-- liquibase formatted sql

-- changeset BojithaPiyathilake:common-ddl-script-v1-create-table-company-objective-0
CREATE TABLE IF NOT EXISTS `company_objective`
(
    `id`            bigint          NOT NULL AUTO_INCREMENT,
    `title`         VARCHAR(200)    NOT NULL,
    `description`   VARCHAR(200)    NOT NULL,
    `year`          int             NOT NULL,
    `time_period`   VARCHAR(50)     DEFAULT NULL,
    PRIMARY KEY (`id`)
    );

-- rollback DROP TABLE `company_objective`;