# JUnit 5 Test Conventions — Skapp Backend

## Unit Test Template

```java
package com.skapp.community.<module>.<package>;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
@DisplayName("MyService Tests")
class MyServiceUnitTest {

    @Mock
    private DependencyA dependencyA;

    @Mock
    private DependencyB dependencyB;

    @InjectMocks
    private MyServiceImpl myService;

    @Nested
    @DisplayName("methodName")
    class MethodNameTests {

        @Test
        void methodName_returnsExpected_whenValidInput() {
            // Arrange
            when(dependencyA.findById(anyLong())).thenReturn(Optional.of(entity));

            // Act
            var result = myService.methodName(1L);

            // Assert
            assertNotNull(result);
            assertEquals("expected", result.getValue());
            verify(dependencyA).findById(1L);
        }

        @Test
        void methodName_throwsException_whenNotFound() {
            when(dependencyA.findById(anyLong())).thenReturn(Optional.empty());

            assertThrows(EntityNotFoundException.class,
                () -> myService.methodName(999L));
        }
    }
}
```

### Unit Test Rules

1. Use `@ExtendWith(MockitoExtension.class)` — NO Spring context
2. Mock ALL dependencies using `@Mock` annotations
3. Create the SUT in `@BeforeEach` or use `@InjectMocks`
4. Test naming: `methodName_expectedBehavior_whenCondition()`
5. AAA pattern: Arrange (`given`/`when`), Act (call method), Assert (`verify`/`assertEquals`)
6. Cover: happy path, error paths, boundary cases, null inputs, validation logic
7. Use `TestConstants` for status values (`STATUS_SUCCESSFUL`, `STATUS_UNSUCCESSFUL`)
8. Use `MockUserFactory` for creating test users when needed
9. Verify mock interactions with `verify()` — check arguments
10. NO hardcoded strings for reusable values — extract to `private static final` constants
11. Group related tests with `@Nested` + `@DisplayName`
12. Test exceptions with `assertThrows`
13. Do NOT test private methods — test through public API
14. Do NOT use `@SpringBootTest` (this is a UNIT test)
15. Do NOT use real database or network calls
16. Do NOT use `Thread.sleep`

---

## Integration Test Template

```java
package com.skapp.community.<module>.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.skapp.support.SecurityTestUtils;
import com.skapp.support.TestConstants;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.json.JsonMapper;

@SpringBootTest(classes = TestSkappApplication.class)
@AutoConfigureMockMvc
@Transactional
@DisplayName("MyController Integration Tests")
class MyControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JsonMapper jsonMapper;

    private static final String BASE_URL = "/v1/my-resource";

    private ResultActions performPostRequest(String url, Object body, String token) throws Exception {
        return mockMvc.perform(post(url)
            .contentType(MediaType.APPLICATION_JSON)
            .header("Authorization", SecurityTestUtils.bearerToken(token))
            .content(jsonMapper.writeValueAsString(body)));
    }

    private ResultActions performGetRequest(String url, String token) throws Exception {
        return mockMvc.perform(get(url)
            .header("Authorization", SecurityTestUtils.bearerToken(token)));
    }

    @Nested
    @DisplayName("POST /v1/my-resource")
    class CreateResource {

        @Test
        void createResource_returns201_whenValidRequest() throws Exception {
            var request = MyRequestDto.builder()
                .name("Test")
                .build();

            performPostRequest(BASE_URL, request, TestConstants.AUTH_TOKEN)
                .andExpect(status().isOk())
                .andExpect(jsonPath(TestConstants.STATUS_PATH).value(TestConstants.STATUS_SUCCESSFUL));
        }

        @Test
        void createResource_returns401_whenNoAuth() throws Exception {
            mockMvc.perform(post(BASE_URL)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isUnauthorized());
        }
    }
}
```

### Integration Test Rules

1. Use `@SpringBootTest(classes = TestSkappApplication.class)` + `@AutoConfigureMockMvc` + `@Transactional`
2. Inject `MockMvc` and `JsonMapper` (from `tools.jackson.databind`)
3. Create reusable `performPostRequest`/`performGetRequest`/`performPatchRequest` helper methods
4. Use `SecurityTestUtils.bearerToken(authToken)` for authenticated requests
5. Use `TestConstants` for JSON path assertions (`STATUS_PATH`, `RESULTS_PATH`, `MESSAGE_PATH`)
6. Test naming: `endpointAction_expectedResult_whenCondition()`
7. Cover per endpoint: valid request → success, missing auth → 401, wrong role → 403, invalid input → 400, not found → error
8. Group tests by endpoint using `@Nested` + `@DisplayName`
9. NO hardcoded URLs — extract to `private static final` constants
10. Use builder patterns or factory methods for request DTOs
11. Do NOT mock the service layer (integration tests test the full stack)
12. Do NOT use `Thread.sleep`
13. Do NOT depend on test execution order
14. `@Transactional` handles rollback — no cleanup needed
