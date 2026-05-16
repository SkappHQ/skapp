-- liquibase formatted sql

-- changeset ErandiDeSilva:people-ddl-script-v1-create_shr_com_work_location_ppl_holiday_table
CREATE TABLE IF NOT EXISTS `shr_com_work_location_ppl_holiday`
(
    `holiday_id`       bigint NOT NULL,
    `work_location_id` bigint NOT NULL,
    PRIMARY KEY (`holiday_id`, `work_location_id`),
    CONSTRAINT `FK_shr_com_work_location_ppl_holiday_holiday_id` FOREIGN KEY (`holiday_id`) REFERENCES `holiday` (`id`) ON DELETE CASCADE,
    CONSTRAINT `FK_shr_com_work_location_ppl_holiday_work_location_id` FOREIGN KEY (`work_location_id`) REFERENCES `com_work_location` (`id`) ON DELETE CASCADE
);

-- rollback drop table shr_com_work_location_ppl_holiday;

