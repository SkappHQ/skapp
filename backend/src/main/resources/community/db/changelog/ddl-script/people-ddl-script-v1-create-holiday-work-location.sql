-- liquibase formatted sql

-- changeset ErandiDeSilva:people-ddl-script-v1-create-holiday-work-location
CREATE TABLE IF NOT EXISTS `holiday_work_location`
(
    `holiday_id`       bigint NOT NULL,
    `work_location_id` bigint NOT NULL,
    PRIMARY KEY (`holiday_id`, `work_location_id`),
    KEY `IDX_holiday_work_location_work_location_id` (`work_location_id`),
    CONSTRAINT `FK_holiday_work_location_holiday` FOREIGN KEY (`holiday_id`) REFERENCES `holiday` (`id`) ON DELETE CASCADE,
    CONSTRAINT `FK_holiday_work_location_work_location` FOREIGN KEY (`work_location_id`) REFERENCES `com_work_location` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB;

-- rollback drop table holiday_work_location;