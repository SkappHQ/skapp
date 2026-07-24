-- liquibase formatted sql

-- Spring Authorization Server storage tables (community / self-hosted single DB).
-- Column definitions must match the schema shipped by the resolved Spring
-- Authorization Server version; verify on build.

-- changeset AkilaSilva:common-v1-create-table-oauth2-registered-client
CREATE TABLE IF NOT EXISTS `oauth2_registered_client` (
    `id`                            varchar(100)  NOT NULL,
    `client_id`                     varchar(100)  NOT NULL,
    `client_id_issued_at`           datetime(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `client_secret`                 varchar(200)  DEFAULT NULL,
    `client_secret_expires_at`      datetime(6)   DEFAULT NULL,
    `client_name`                   varchar(200)  NOT NULL,
    `client_authentication_methods` varchar(1000) NOT NULL,
    `authorization_grant_types`     varchar(1000) NOT NULL,
    `redirect_uris`                 varchar(1000) DEFAULT NULL,
    `post_logout_redirect_uris`     varchar(1000) DEFAULT NULL,
    `scopes`                        varchar(1000) NOT NULL,
    `client_settings`               varchar(2000) NOT NULL,
    `token_settings`                varchar(2000) NOT NULL,
    CONSTRAINT `PK_oauth2_registered_client` PRIMARY KEY (`id`)
);
-- rollback DROP TABLE IF EXISTS `oauth2_registered_client`;

-- changeset AkilaSilva:common-v1-create-table-oauth2-authorization
CREATE TABLE IF NOT EXISTS `oauth2_authorization` (
    `id`                            varchar(100)  NOT NULL,
    `registered_client_id`          varchar(100)  NOT NULL,
    `principal_name`                varchar(200)  NOT NULL,
    `authorization_grant_type`      varchar(100)  NOT NULL,
    `authorized_scopes`             varchar(1000) DEFAULT NULL,
    `attributes`                    blob          DEFAULT NULL,
    `state`                         varchar(500)  DEFAULT NULL,
    `authorization_code_value`      blob          DEFAULT NULL,
    `authorization_code_issued_at`  datetime(6)   DEFAULT NULL,
    `authorization_code_expires_at` datetime(6)   DEFAULT NULL,
    `authorization_code_metadata`   blob          DEFAULT NULL,
    `access_token_value`            blob          DEFAULT NULL,
    `access_token_issued_at`        datetime(6)   DEFAULT NULL,
    `access_token_expires_at`       datetime(6)   DEFAULT NULL,
    `access_token_metadata`         blob          DEFAULT NULL,
    `access_token_type`             varchar(100)  DEFAULT NULL,
    `access_token_scopes`           varchar(1000) DEFAULT NULL,
    `oidc_id_token_value`           blob          DEFAULT NULL,
    `oidc_id_token_issued_at`       datetime(6)   DEFAULT NULL,
    `oidc_id_token_expires_at`      datetime(6)   DEFAULT NULL,
    `oidc_id_token_metadata`        blob          DEFAULT NULL,
    `refresh_token_value`           blob          DEFAULT NULL,
    `refresh_token_issued_at`       datetime(6)   DEFAULT NULL,
    `refresh_token_expires_at`      datetime(6)   DEFAULT NULL,
    `refresh_token_metadata`        blob          DEFAULT NULL,
    `user_code_value`               blob          DEFAULT NULL,
    `user_code_issued_at`           datetime(6)   DEFAULT NULL,
    `user_code_expires_at`          datetime(6)   DEFAULT NULL,
    `user_code_metadata`            blob          DEFAULT NULL,
    `device_code_value`             blob          DEFAULT NULL,
    `device_code_issued_at`         datetime(6)   DEFAULT NULL,
    `device_code_expires_at`        datetime(6)   DEFAULT NULL,
    `device_code_metadata`          blob          DEFAULT NULL,
    CONSTRAINT `PK_oauth2_authorization` PRIMARY KEY (`id`)
);
-- rollback DROP TABLE IF EXISTS `oauth2_authorization`;

-- changeset AkilaSilva:common-v1-create-table-oauth2-authorization-consent
CREATE TABLE IF NOT EXISTS `oauth2_authorization_consent` (
    `registered_client_id` varchar(100)  NOT NULL,
    `principal_name`       varchar(200)  NOT NULL,
    `authorities`          varchar(1000) NOT NULL,
    CONSTRAINT `PK_oauth2_authorization_consent` PRIMARY KEY (`registered_client_id`, `principal_name`)
);
-- rollback DROP TABLE IF EXISTS `oauth2_authorization_consent`;
