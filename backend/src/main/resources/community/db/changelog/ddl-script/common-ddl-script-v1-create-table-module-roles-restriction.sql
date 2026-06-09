-- liquibase formatted sql

-- changeset shakila:00081_create_table_module_roles_restriction
CREATE TABLE IF NOT EXISTS `module_roles_restriction`
(
    `module`       VARCHAR(255) NOT NULL,
    `restrictions` VARCHAR(255) DEFAULT NULL,
    PRIMARY KEY (`module`)
);

-- rollback DROP TABLE `module_roles_restriction`;
