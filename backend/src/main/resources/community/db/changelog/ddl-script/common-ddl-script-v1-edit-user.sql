-- liquibase formatted sql

-- changeset ChathurikaAmarasinghe:common-ddl-script-v1-edit-user

ALTER TABLE `user`
    MODIFY COLUMN password varchar(255)
;

-- rollback ALTER TABLE `user` MODIFY COLUMN password varchar(255);

ALTER TABLE `user`
    ADD COLUMN `login_method` varchar(255) NULL DEFAULT 'CREDENTIALS'
;

-- rollback ALTER TABLE `user` DROP COLUMN `login_method`;