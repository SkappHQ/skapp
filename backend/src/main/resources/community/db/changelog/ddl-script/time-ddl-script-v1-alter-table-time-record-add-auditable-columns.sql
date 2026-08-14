-- liquibase formatted sql

-- changeset ErandiDeSilva:alter_table_add_auditable_columns_to_time_request_table
ALTER TABLE `time_request`
    ADD COLUMN    `created_by`         varchar(255)          DEFAULT NULL,
    ADD COLUMN    `last_modified_by`   varchar(255)          DEFAULT NULL,
    ADD COLUMN    `last_modified_date` datetime(6)           DEFAULT NULL;

-- rollback ALTER TABLE `time_request`
-- DROP COLUMN `created_by`,
-- DROP COLUMN `last_modified_by`,
-- DROP COLUMN `last_modified_date`;