-- liquibase formatted sql

-- changeset AkilaSilva:people-ddl-script-v1-create-table-com-work-location-geofence
CREATE TABLE IF NOT EXISTS `com_work_location_geofence`
(
    `id`                 bigint      NOT NULL AUTO_INCREMENT,
    `work_location_id`   bigint      NOT NULL,
    `latitude`           text        NOT NULL,
    `longitude`          text        NOT NULL,
    `radius_meters`      int         NOT NULL,
    `created_by`         text                 DEFAULT NULL,
    `created_date`       datetime(6)          DEFAULT NULL,
    `last_modified_by`   text                 DEFAULT NULL,
    `last_modified_date` datetime(6)          DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `UK_com_work_location_geofence_work_location_id` (`work_location_id`),
    CONSTRAINT `FK_com_work_location_geofence_work_location_id` FOREIGN KEY (`work_location_id`) REFERENCES `com_work_location` (`id`)
);

-- rollback DROP TABLE `com_work_location_geofence`;
