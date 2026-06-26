CREATE TABLE google_workspace_connection
(
    id                 BIGINT AUTO_INCREMENT NOT NULL,
    access_token       TEXT NULL,
    refresh_token      TEXT NOT NULL,
    token_expiry       datetime NULL,
    connected_by_email VARCHAR(255) NULL,
    connected_at       datetime NULL,
    is_active          TINYINT(1) DEFAULT 1 NOT NULL,
    CONSTRAINT pk_google_workspace_connection PRIMARY KEY (id)
);