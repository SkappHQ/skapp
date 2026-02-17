-- liquibase formatted sql

-- changeset system:common-ddl-script-v1-add-user-lang
ALTER TABLE `user`
    ADD COLUMN `lang` text
;

-- rollback ALTER TABLE `user` DROP COLUMN `lang`;
