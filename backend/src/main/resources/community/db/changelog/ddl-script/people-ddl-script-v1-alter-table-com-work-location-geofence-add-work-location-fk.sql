-- liquibase formatted sql

-- changeset shakila:people-ddl-script-v1-alter-table-com-work-location-geofence-add-work-location-fk
ALTER TABLE `com_work_location_geofence`
    ADD CONSTRAINT `FK_com_work_location_geofence_com_work_location_id` FOREIGN KEY (`work_location_id`) REFERENCES `com_work_location` (`id`);

-- rollback ALTER TABLE `com_work_location_geofence` DROP FOREIGN KEY `FK_com_work_location_geofence_com_work_location_id`;
