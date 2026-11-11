# Backend (Spring Boot)

Spring Boot 4, Java 21, JPA, Liquibase. Root package `com.skapp.community`. Active profile comes from `SPRING_PROFILES_ACTIVE` (`application-non-prd.yml` / `application-prd.yml`).

## Layout

- `src/main/java/com/skapp/community/<module>/` — modules: `common`, `leaveplanner`, `peopleplanner`, `timeplanner`, `crmplanner`, `okrplanner`.
- Inside a module: `controller`, `service` (+ `service/impl`), `repository`, `model` (entities), `payload` (request/response DTOs), `mapper`, `constant`, `type` (enums), `util`.
- Shared building blocks are in `common`: `DateTimeUtils`, `ModuleException`, `GlobalExceptionHandler`.
- Message texts: `src/main/resources/community/messages/<module>-messages.properties`, keyed by the module's `*MessageConstant` (e.g. `LeaveMessageConstant`).
- Liquibase: `src/main/resources/community/db/changelog/` (master `db.changelog.yml`, scripts in `ddl-script/` named `<module>-ddl-script-v1-<description>.sql`).

## Controllers

- One resource per controller. GET methods first, then mutating ones.
- No `@NonNull` on controller parameters.
- `@PreAuthorize`: use the same roles as sibling endpoints. Don't add `SUPER_ADMIN` when a module admin role already covers it.
- A state change on an existing record is `PATCH`. Deactivate/status endpoints return a small status DTO, not the full entity.

## Services and validation

- Validate in a `<Feature>ValidationUtil` called from the service. Don't use bean-validation annotations on DTOs, and don't write inline `if (...) throw` blocks in service methods.
- Bound pagination input (`page >= 0`, `size >= 1`, capped max) in the service.
- Throw `ModuleException` with a message constant, not generic runtime exceptions. Don't throw it from inside a `catch`; return a boolean from a util and branch, or register the exception in `GlobalExceptionHandler`.
- No magic values (including bare `1`): use the module's constants class, and reuse an existing constant first.
- Generic helpers go in util classes (date/time → `DateTimeUtils`), not private service methods.
- Every service method logs entry and exit with fixed text and no dynamic values:
  ```java
  log.info("methodName: execution started");
  log.info("methodName: execution ended");
  ```

## Entities and repositories

- No `columnDefinition` on `@Column`. Liquibase owns the schema.
- Boxed boolean defaults use `Boolean.TRUE` / `Boolean.FALSE`. Don't initialise collection fields.
- Don't duplicate defaults in DTOs that the entity already defines.
- Derived queries use literal suffixes: `findByTypeIdAndIsActiveTrue`, not `findByTypeIdAndIsActive(id, true)`.
- Criteria API uses the generated JPA metamodel (`root.get(LeavePolicy_.name)`), never string attribute names.

## Liquibase / DDL

- Never edit an applied changeset. Add a new script and register it in the changelog.
- These scripts are the community (single-database) schema only. Enterprise deployments migrate from a separate repo, so a schema change usually needs a matching script there too.
- `text`, not `varchar`. `boolean`, not `bit`.
- No `DEFAULT` clauses (including `DEFAULT NULL`); defaults live in the entity.
- No unique constraints. Uniqueness is enforced with an `existsBy...` check in the service.

## Tests

- Service and controller behaviour is covered by integration tests: `src/test/java/com/skapp/community/<module>/controller/*ControllerIntegrationTest.java` (H2, `src/test/resources/data.sql`).
- Unit tests are only for utils. Don't add `*ServiceImplUnitTest` classes.
- New endpoints need integration coverage, including the `@PreAuthorize` cases.
