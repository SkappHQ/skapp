-- liquibase formatted sql

-- changeset BojithaPiyathilake:common-ddl-script-v1-create-table-company-objective
CREATE TABLE IF NOT EXISTS `okr_company_objective`
(
    `id`            bigint          NOT NULL AUTO_INCREMENT,
    `title`         TEXT            NOT NULL,
    `description`   TEXT            NOT NULL,
    `year`          int             NOT NULL,
    `time_period`   TEXT            NOT NULL,
    PRIMARY KEY (`id`)
    );

-- rollback DROP TABLE `company_objective`;