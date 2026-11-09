-- liquibase formatted sql

-- changeset AkilaSilva:common-dml-script-v1-update-user-set-temp-password-expires-at
UPDATE `user`
SET `temp_password_expires_at` = DATE_ADD(UTC_TIMESTAMP(6), INTERVAL 24 HOUR)
WHERE `temp_password` IS NOT NULL
  AND (`is_password_changed` = 0 OR `is_password_changed` IS NULL);

-- rollback UPDATE `user` SET `temp_password_expires_at` = NULL;
