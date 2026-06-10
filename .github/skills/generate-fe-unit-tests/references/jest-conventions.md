# Jest Unit Test Conventions — Skapp Frontend

## Project Setup

- Framework: Next.js 14 + React 18 + TypeScript
- Test runner: Jest + jest-environment-jsdom
- State management: Zustand
- Forms: Formik + Yup validation
- Module aliases: `~community` → `src/community`, `~enterprise` → `src/fallback`
- Test co-location: Tests live next to source files (`foo.ts` → `foo.test.ts`)

## Critical Mocking Rules

### 1. commonUtil mock (ALWAYS add if imported)

If the source file imports from `~community/common/utils/commonUtil`, you MUST add:

```typescript
jest.mock('~community/common/utils/commonUtil', () => ({
  formatDate: jest.fn((d) => d),
  formatEmptyString: jest.fn((s) => s || null),
  formatPhoneNumber: jest.fn((code, phone) => code && phone ? code + phone : '')
}));
```

This avoids `Request is not defined` from `next/server.js`.

### 2. External module mocks

If the source file imports from `next-auth`, `axios`, or any API module, mock them.

### 3. Zustand store mocks

```typescript
jest.mock('~community/<module>/store/store', () => ({
  useStore: jest.fn(() => ({ /* mock store values */ }))
}));
```

### 4. react-i18next mock

```typescript
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key })
}));
```

## Testing Conventions

1. **File naming**: `<source>.test.ts` or `<source>.test.tsx` (match source extension)
2. **describe blocks**: Group by function/feature
3. **Test naming**: `should <expected behavior> when <condition>`
4. **AAA pattern**: Arrange → Act → Assert
5. **Coverage**: happy path, edge cases, error conditions, null/undefined inputs
6. **Yup schemas**: use `schema.validate()` with `rejects.toThrow()` for invalid data
7. **Utility functions**: test each exported function independently
8. **Hooks**: use `renderHook` from `@testing-library/react`
9. Do NOT test implementation details — test behavior and outputs
10. Do NOT add tests for scenarios the code doesn't handle (e.g. don't test name character validation if the schema only has `required` + `max` length)

## Template

```typescript
import { functionToTest } from "./sourceFile";

// Mock external dependencies
jest.mock("~community/common/utils/commonUtil", () => ({
  formatDate: jest.fn((d) => d),
}));

describe("functionToTest", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return expected result when given valid input", () => {
    // Arrange
    const input = { /* ... */ };

    // Act
    const result = functionToTest(input);

    // Assert
    expect(result).toEqual(/* expected */);
  });

  it("should handle null input gracefully", () => {
    const result = functionToTest(null);
    expect(result).toBeNull();
  });

  it("should throw when given invalid input", () => {
    expect(() => functionToTest(undefined)).toThrow();
  });
});
```
