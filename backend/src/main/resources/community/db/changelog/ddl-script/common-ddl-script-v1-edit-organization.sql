-- liquibase formatted sql

-- changeset YuhangaInduwara:common-ddl-script-v1-edit-organization

ALTER TABLE `organization`
    MODIFY COLUMN organization_logo varchar(255)
;

-- rollback ALTER TABLE `organization` MODIFY COLUMN organization_logo varchar(100);
