CREATE TABLE external_person_sync_log
(
    id            BIGINT AUTO_INCREMENT NOT NULL,
    sync_channel  VARCHAR(20)           NOT NULL,
    sync_type     VARCHAR(20)           NOT NULL,
    status        VARCHAR(20)           NOT NULL,
    initiated_by  VARCHAR(255)          NULL,
    started_at    DATETIME              NOT NULL,
    completed_at  DATETIME              NULL,
    total_staged  INT                   DEFAULT 0 NOT NULL,
    total_failed  INT                   DEFAULT 0 NOT NULL,
    error_message TEXT                  NULL,
    CONSTRAINT pk_external_person_sync_log PRIMARY KEY (id)
);
