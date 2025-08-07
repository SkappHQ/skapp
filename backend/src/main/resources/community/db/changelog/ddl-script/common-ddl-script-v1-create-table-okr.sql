-- liquibase formatted sql

-- changeset attigala:common-ddl-script-v1-create-table-okr
CREATE TABLE team_objective (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    effective_time_period BIGINT NOT NULL,
    duration VARCHAR(255) NOT NULL
);

CREATE TABLE key_result (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(50),
    lower_limit DOUBLE,
    upper_limit DOUBLE,
    team_objective_id BIGINT NOT NULL,
    CONSTRAINT fk_key_result_team_objective FOREIGN KEY (team_objective_id)
        REFERENCES team_objective(id)
);

CREATE TABLE key_result_assigned_team (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    key_result_id BIGINT NOT NULL,
    team_id BIGINT NOT NULL,
    CONSTRAINT fk_assigned_team_key_result FOREIGN KEY (key_result_id)
        REFERENCES key_result(id),
    CONSTRAINT fk_assigned_team_team FOREIGN KEY (team_id)
        REFERENCES team(team_id)
);

CREATE TABLE team_objective_assigned_team (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    team_objective_id BIGINT NOT NULL,
    team_id BIGINT NOT NULL,
    CONSTRAINT fk_assigned_team_team_objective FOREIGN KEY (team_objective_id)
        REFERENCES team_objective(id),
    CONSTRAINT fk_objective_assigned_team_team FOREIGN KEY (team_id)
        REFERENCES team(team_id)
);

--rollback DROP TABLE team_objective_assigned_team;
--rollback DROP TABLE key_result_assigned_team;
--rollback DROP TABLE key_result;
--rollback DROP TABLE team_objective;