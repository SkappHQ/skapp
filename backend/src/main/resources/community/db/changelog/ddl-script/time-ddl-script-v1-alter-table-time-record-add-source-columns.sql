-- liquibase formatted sql

-- changeset akila:00121_alter_table_time_record_add_clock_in_out_source_columns
ALTER TABLE `time_record`
    ADD COLUMN `clock_in_source` varchar(20) NULL,
    ADD COLUMN `clock_out_source` varchar(20) NULL;

-- rollback ALTER TABLE `time_record` DROP COLUMN `clock_in_source`, DROP COLUMN `clock_out_source`;
