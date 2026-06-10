# Project: Skapp — HR Management Platform

## Architecture
- **Backend**: Spring Boot 4.0.3 + Java 21 + JPA + MySQL + JWT Auth
- **Frontend**: Next.js 14 + React 18 + TypeScript + TailwindCSS
- **Testing**: JUnit 5 + Mockito (backend unit), Spring Boot Test + MockMvc (integration), Playwright (E2E)
- **Build**: Maven (backend), npm (frontend)

## Backend Structure
- `backend/src/main/java/com/skapp/` — Source code root
- Modules: `community/` (open-source), `enterprise/` (licensed)
- Community modules: `common/`, `peopleplanner/`, `leaveplanner/`, `timeplanner/`, `crmplanner/`, `okrplanner/`
- Each module has: `controller/`, `service/`, `repository/`, `model/`, `payload/`, `mapper/`, `constant/`, `type/`, `util/`
- API versioning: `/v1/` prefix for all endpoints
- Security: `@PreAuthorize` with roles (SUPER_ADMIN, PEOPLE_ADMIN, LEAVE_ADMIN, ATTENDANCE_ADMIN, etc.)
- Response wrapper: `ResponseEntityDto` with `status` and `results` fields

## Backend Test Structure
- `backend/src/test/java/com/skapp/` — Test root
- Support utilities: `support/TestConstants.java`, `support/SecurityTestUtils.java`, `support/MockUserFactory.java`
- Test config: `TestSkappApplication.java` (Spring context for tests)
- Integration tests: `@SpringBootTest` + `@AutoConfigureMockMvc` + `@Transactional`
- Unit tests: `@ExtendWith(MockitoExtension.class)`

## Frontend Structure
- `frontend/src/community/` — Community feature source
- `frontend/src/enterprise/` — Enterprise feature source
- `frontend/pages/` — Next.js pages
- Module aliases: `~community`, `~enterprise`, `~public`, `~styles`, `~i18n`

## Enterprise Testing Standards

### Backend Unit Tests (JUnit 5 + Mockito)
- **Pattern**: Arrange → Act → Assert
- **Naming**: `methodName_expectedBehavior_whenCondition()`
- **Isolation**: `@ExtendWith(MockitoExtension.class)`, fresh mocks per test
- **Coverage**: Happy path + error paths + boundary cases + validation + security
- **No hardcoding**: Use `TestConstants`, factory methods, enums
- **Mock discipline**: Mock at boundaries (DAOs, external services), verify call arguments
- **Security**: Test `@PreAuthorize`, guards, input validation

### Backend Integration Tests (Spring Boot Test + MockMvc)
- **Annotations**: `@SpringBootTest(classes = TestSkappApplication.class)`, `@AutoConfigureMockMvc`, `@Transactional`
- **Grouping**: `@Nested` classes with `@DisplayName`
- **Auth**: Use `SecurityTestUtils.bearerToken(authToken)` for authenticated requests
- **Assertions**: JSONPath with `TestConstants` (STATUS_PATH, RESULTS_PATH, etc.)
- **Request helpers**: Reusable `performPostRequest`, `performGetRequest` methods

### E2E Tests (Playwright)
- **CRUD lifecycle**: Create → Read → Update → Delete
- **Auth matrix**: Valid/invalid/expired/no token + wrong roles
- **Contract testing**: Status codes, body structure, field types
- **Input validation**: Missing fields, invalid types, boundaries
- **Constants**: All endpoints, test data as named constants
- **Reliability**: No delays, unique data, parallel-safe

## Build & Run
- Backend: `cd backend && ./mvnw spring-boot:run`
- Backend tests: `cd backend && ./mvnw test`
- Frontend: `cd frontend && npm run dev`
- Frontend tests: `cd frontend && npm test`
- E2E: `cd <e2e-repo> && npx playwright test`
