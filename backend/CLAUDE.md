# Backend

Root package `com.skapp.community`. Modules follow `controller / service(impl) / repository / model / payload / mapper / constant`.

## Code

- Validate in a `<Feature>ValidationUtil` called from the service: no bean-validation annotations, no inline `if (...) throw`.
- Throw `ModuleException` with a message constant (`<module>-messages.properties`). Never throw it from a `catch`.
- No magic values, including bare `1`. Reuse existing constants first.
- Generic helpers go in util classes (`DateTimeUtils`), not private service methods.
- Every service method logs `log.info("methodName: execution started")` and `"... execution ended"`, with no dynamic values.
- Controllers: GETs first, no `@NonNull` on params, `@PreAuthorize` roles match sibling endpoints. State changes are `PATCH` and return a small status DTO.
- Bound pagination input in the service.

## Entities and Liquibase

- No `columnDefinition`, no initialised collections, `Boolean.TRUE/FALSE` for defaults.
- Derived queries use literal suffixes (`...AndIsActiveTrue`). Criteria API uses the JPA metamodel, not strings.
- Never edit an applied changeset; add a new script in `community/db/changelog/ddl-script/`. Enterprise migrates from a separate repo, which usually needs a matching script.
- DDL: `text` not `varchar`, `boolean` not `bit`, no `DEFAULT`, no unique constraints (use `existsBy...` checks).

## Tests

- Cover behaviour with `*ControllerIntegrationTest` (H2, `src/test/resources/data.sql`), including `@PreAuthorize` cases. Unit tests only for utils.
