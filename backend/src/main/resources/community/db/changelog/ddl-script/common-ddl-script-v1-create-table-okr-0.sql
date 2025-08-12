-- liquibase formatted sql

-- changeset BojithaPiyathilake:common-ddl-script-v1-create-table-okr-0
CREATE TABLE IF NOT EXISTS `okr_config`
(
    `id`        bigint                                  NOT NULL AUTO_INCREMENT,
    `frequency` enum ('ANNUAL','BI_ANNUAL','QUARTERLY') NOT NULL DEFAULT 'ANNUAL',
    PRIMARY KEY (`id`)
) ENGINE = InnoDB;

-- rollback DROP TABLE `okr_config`;