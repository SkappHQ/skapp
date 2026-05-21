package com.skapp.community.crmplanner.util;

import com.skapp.TestSkappApplication;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.crmplanner.constant.CrmConstants;
import com.skapp.community.crmplanner.constant.CrmMessageConstant;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

@SpringBootTest(classes = TestSkappApplication.class)
@DisplayName("CRM Contact Validations Unit Tests")
class CrmContactValidationsTest {

	@Nested
	@DisplayName("validateContactName")
	class ValidateContactName {

		@Test
		@DisplayName("Blank name - throws CRM_ERROR_CONTACT_NAME_REQUIRED")
		void validateContactName_BlankName_ThrowsRequired() {
			ModuleException ex = assertThrows(ModuleException.class, () -> CrmValidations.validateContactName("   "));
			assertEquals(CrmMessageConstant.CRM_ERROR_CONTACT_NAME_REQUIRED, ex.getMessageKey());
		}

		@Test
		@DisplayName("Name exceeding max length - throws CRM_ERROR_CONTACT_NAME_TOO_LONG")
		void validateContactName_TooLong_ThrowsTooLong() {
			String tooLong = "A".repeat(CrmConstants.CONTACT_NAME_MAX_LENGTH + 1);
			ModuleException ex = assertThrows(ModuleException.class, () -> CrmValidations.validateContactName(tooLong));
			assertEquals(CrmMessageConstant.CRM_ERROR_CONTACT_NAME_TOO_LONG, ex.getMessageKey());
		}

		@Test
		@DisplayName("Valid name - does not throw")
		void validateContactName_ValidName_DoesNotThrow() {
			assertDoesNotThrow(() -> CrmValidations.validateContactName("Jane Cooper"));
		}

	}

	@Nested
	@DisplayName("validateContactEmail")
	class ValidateContactEmail {

		@Test
		@DisplayName("Blank email - throws CRM_ERROR_CONTACT_EMAIL_REQUIRED")
		void validateContactEmail_BlankEmail_ThrowsRequired() {
			ModuleException ex = assertThrows(ModuleException.class, () -> CrmValidations.validateContactEmail("   "));
			assertEquals(CrmMessageConstant.CRM_ERROR_CONTACT_EMAIL_REQUIRED, ex.getMessageKey());
		}

		@Test
		@DisplayName("Invalid email - throws CRM_ERROR_CONTACT_EMAIL_INVALID")
		void validateContactEmail_InvalidEmail_ThrowsInvalid() {
			ModuleException ex = assertThrows(ModuleException.class,
					() -> CrmValidations.validateContactEmail("invalid-email"));
			assertEquals(CrmMessageConstant.CRM_ERROR_CONTACT_EMAIL_INVALID, ex.getMessageKey());
		}

		@Test
		@DisplayName("Valid email - does not throw")
		void validateContactEmail_ValidEmail_DoesNotThrow() {
			assertDoesNotThrow(() -> CrmValidations.validateContactEmail("jane.cooper@example.com"));
		}

	}

}
