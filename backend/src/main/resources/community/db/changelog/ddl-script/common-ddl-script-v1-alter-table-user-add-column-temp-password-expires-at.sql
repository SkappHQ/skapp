-- liquibase formatted sql

-- changeset AkilaSilva:common-ddl-script-v1-alter-table-user-add-column-temp-password-expires-at
ALTER TABLE `user`
    ADD COLUMN `temp_password_expires_at` datetime(6);

-- rollback ALTER TABLE `user` DROP COLUMN `temp_password_expires_at`;
