---
name: generate-fe-unit-tests
description: 'Generate Jest unit tests for changed frontend source files. Use when: creating FE unit tests, generating Jest tests, testing React hooks/utils/actions/store, covering changed frontend code with tests.'
argument-hint: 'Module and feature name, e.g. "people add" or "leave apply"'
---

# Generate Frontend Unit Tests

Generate comprehensive Jest unit tests for changed frontend source files in a Skapp module.

## When to Use

- After making changes to frontend utility functions, hooks, actions, or store files
- When a feature branch has untested frontend code
- When asked to "generate unit tests" or "add FE tests"

## Inputs

The user should provide:
- **Module**: `people`, `leave`, `attendance`, `settings`, or `configurations`
- **Feature** (optional): Feature name to filter files (e.g. `add`, `quick-add`, `teams`)

If not provided, infer the module from the current branch name or changed files.

## Procedure

### Step 1: Detect changed files

Run in terminal to find changed frontend files for the module:

```
git diff --name-only origin/main -- "frontend/src/community/<MODULE>/**/*.ts" "frontend/src/community/<MODULE>/**/*.tsx"
```

If no results, try `origin/develop` or `HEAD~10` as the base.

Also check the enterprise frontend submodule at `frontend/src/enterprise/` — navigate into that directory and run `git diff --name-only origin/develop` to find enterprise changes.

### Step 2: Filter to testable files

From the changed files, keep only files in testable directories: `utils`, `hooks`, `actions`, `store`, `helpers`.

Exclude files matching: `types`, `enums`, `constants`, `index.ts`, `.css`, `.scss`, `.json`, `QueryKeys`, `configs`.

Check if each file already has a co-located test file (e.g. `foo.ts` → `foo.test.ts`). Categorize files into:
- **Needs new test**: no test file exists → generate from scratch
- **Needs test update**: test file exists but source file has changed → read the existing test, extend/update it to cover the new/modified code while keeping all existing passing tests

### Step 3: Load reference patterns

Find an existing `.test.ts` or `.test.tsx` file in the same module for style reference:

```
find frontend/src/community/<MODULE> -name "*.test.ts" -o -name "*.test.tsx" | head -3
```

Read one of these files to understand the existing test patterns and style.

### Step 4: Read source and generate tests

For each file that needs tests or test updates:

1. Read the full source file content
2. Read the first 50 lines of imported local modules (starting with `.` or `~`) to understand dependencies for mocking
3. If an existing test file exists, read it fully — preserve all existing passing tests and add new test cases for the changed/added code
4. Generate the test file following the conventions in [jest-conventions.md](./references/jest-conventions.md)
5. Write the test file next to the source file: `<source>.test.ts` or `<source>.test.tsx` (match source extension)

### Step 5: Run tests to verify

Run Jest to verify the generated tests pass:

```
cd frontend && npx jest --testPathPattern="src/community/<MODULE>" --no-coverage
```

If tests fail, read the error output, fix the test file, and re-run.

### Step 6: Commit

Stage and commit the generated test files automatically:

```
git add frontend/src/community/<MODULE>/**/*.test.ts frontend/src/community/<MODULE>/**/*.test.tsx
git commit -m "test: add unit tests for <MODULE>/<FEATURE>"
```

## Important Notes

- Generated tests are committed to the **feature branch** (same PR as the feature code)
- Tests must pass before committing — fix failures before moving on
- Do NOT test implementation details — test behavior and outputs
- Do NOT add tests for scenarios the code doesn't handle
