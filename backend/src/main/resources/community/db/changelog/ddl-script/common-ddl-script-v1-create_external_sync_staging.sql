CREATE TABLE external_sync_staging
(
    id           BIGINT AUTO_INCREMENT NOT NULL,
    email        VARCHAR(255)          NOT NULL,
    first_name   VARCHAR(255)          NULL,
    last_name    VARCHAR(255)          NULL,
    google_status VARCHAR(50)          NULL,
    photo_url     VARCHAR(500)          NULL,
    change_type  VARCHAR(20)           NOT NULL,
    decision     VARCHAR(20)           DEFAULT 'PENDING' NOT NULL,
    sync_channel VARCHAR(20)           NOT NULL,
    synced_at    DATETIME              NOT NULL,
    reviewed_at  DATETIME              NULL,
    reviewed_by  VARCHAR(255)          NULL,
    CONSTRAINT pk_external_sync_staging PRIMARY KEY (id)
);
