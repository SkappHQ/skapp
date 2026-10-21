-- liquibase formatted sql

-- changeset AkilaSilva:common-ddl-script-v1-alter-table-user-version-add-session-version
ALTER TABLE `user_version`
    ADD COLUMN `session_version` BIGINT;

-- rollback ALTER TABLE `user_version` DROP COLUMN `session_version`;
