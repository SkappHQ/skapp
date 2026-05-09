---
name: generate-be-tests
description: 'Generate JUnit 5 backend tests for changed Java source files. Use when: creating backend tests, generating JUnit tests, unit testing Java services, integration testing Spring Boot controllers, testing Java code.'
argument-hint: 'Optional: test type and files, e.g. "Unit" or "Integration" or specific file path'
---

# Generate Backend Tests (JUnit 5)

Generate JUnit 5 + Mockito unit tests and Spring Boot integration tests for changed Java source files.

## When to Use

- After making changes to backend services, controllers, or utilities
- When a feature branch has untested Java code
- When asked to "generate backend tests", "add JUnit tests", or "test Java code"

## Inputs

The user may provide:
- **TestType** (optional): `Unit`, `Integration`, or `Both` (default: `Both`)
- **Files** (optional): Specific Java file paths to test
- **BaseBranch** (optional): Branch to diff against (default: `develop`)

## Procedure

### Step 1: Detect changed files

Run git diff to find changed Java source files:

```
git diff --name-only origin/develop -- "backend/src/main/java/com/skapp/**/*.java"
```

If no results, try `HEAD~10` as the base.

Also check the enterprise backend submodule at `backend/src/main/java/com/skapp/enterprise/`:

```
cd backend/src/main/java/com/skapp/enterprise && git diff --name-only origin/develop
```

### Step 2: Filter to testable files

Keep only files in testable packages: `controller`, `service`, `util`, `component`, `repository`.

Exclude files in: `model`, `payload`, `type`, `constant`, `config`, `mapper`.

Skip files in: `model`, `payload`, `type`, `constant`, `config`, `mapper`.

Check if each file already has a corresponding test file:
- `<ClassName>.java` → check for `<ClassName>UnitTest.java` or `<ClassName>IntegrationTest.java` in the mirrored test path

Categorize files into:
- **Needs new test**: no test file exists → generate from scratch
- **Needs test update**: test file exists but source file has changed → read the existing test, extend/update it to cover new/modified methods while preserving all existing passing tests

### Step 3: Load test support utilities

Read the test support files for context:
- `backend/src/test/java/com/skapp/support/TestConstants.java`
- `backend/src/test/java/com/skapp/support/SecurityTestUtils.java`
- `backend/src/test/java/com/skapp/support/MockUserFactory.java`

These provide reusable constants and factory methods for tests.

### Step 4: Determine test type per file

- **Service/Util/Component** files → generate **Unit** test
- **Controller** files → generate **Integration** test
- If no specific match → generate **Unit** test

### Step 5: Generate test files

For each file, read the full source content and generate:

- **Unit tests**: Follow conventions in [junit-conventions.md](./references/junit-conventions.md) — "Unit Test" section
- **Integration tests**: Follow conventions in [junit-conventions.md](./references/junit-conventions.md) — "Integration Test" section

Write to the mirrored test path:
- Source: `backend/src/main/java/com/skapp/.../MyService.java`
- Unit test: `backend/src/test/java/com/skapp/.../MyServiceUnitTest.java`
- Integration test: `backend/src/test/java/com/skapp/.../MyControllerIntegrationTest.java`

Create the test directory if it doesn't exist.

### Step 6: Verify with Maven

Run Maven to verify the generated tests compile and pass:

```
cd backend && ./mvnw test -pl . -Dtest="*Test" -DfailIfNoTests=false
```

On Windows, use `mvnw.cmd` instead of `./mvnw`.

If tests fail, read the error output, fix the test file, and re-run.

## Important Notes

- Unit tests use `@ExtendWith(MockitoExtension.class)` — NO Spring context
- Integration tests use `@SpringBootTest(classes = TestSkappApplication.class)`
- Test naming: `methodName_expectedBehavior_whenCondition()`
- Each test should be independent and idempotent
