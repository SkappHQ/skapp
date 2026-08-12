-- liquibase formatted sql

-- changeset shakila:people-ddl-script-v1-alter-table-shr-com-work-location-ppl-holiday-drop-work-location-cascade
ALTER TABLE `shr_com_work_location_ppl_holiday`
    DROP FOREIGN KEY `FK_shr_com_work_location_ppl_holiday_work_location_id`;
ALTER TABLE `shr_com_work_location_ppl_holiday`
    ADD CONSTRAINT `FK_shr_com_work_location_ppl_holiday_work_location_id` FOREIGN KEY (`work_location_id`) REFERENCES `com_work_location` (`id`);

-- rollback ALTER TABLE `shr_com_work_location_ppl_holiday` DROP FOREIGN KEY `FK_shr_com_work_location_ppl_holiday_work_location_id`;
-- rollback ALTER TABLE `shr_com_work_location_ppl_holiday` ADD CONSTRAINT `FK_shr_com_work_location_ppl_holiday_work_location_id` FOREIGN KEY (`work_location_id`) REFERENCES `com_work_location` (`id`) ON DELETE CASCADE;
