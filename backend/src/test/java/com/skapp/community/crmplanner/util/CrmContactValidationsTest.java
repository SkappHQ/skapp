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

		@Test
		@DisplayName("Name with hyphen - does not throw")
		void validateContactName_WithHyphen_DoesNotThrow() {
			assertDoesNotThrow(() -> CrmValidations.validateContactName("Mary-Jane Watson"));
		}

		@Test
		@DisplayName("Name with period - does not throw")
		void validateContactName_WithPeriod_DoesNotThrow() {
			assertDoesNotThrow(() -> CrmValidations.validateContactName("Dr. John Smith"));
		}

		@Test
		@DisplayName("Name with comma - does not throw")
		void validateContactName_WithComma_DoesNotThrow() {
			assertDoesNotThrow(() -> CrmValidations.validateContactName("Smith, John"));
		}

		@Test
		@DisplayName("Unicode name - does not throw")
		void validateContactName_UnicodeName_DoesNotThrow() {
			assertDoesNotThrow(() -> CrmValidations.validateContactName("Ångström Müller"));
		}

		@Test
		@DisplayName("Name with apostrophe - throws CRM_ERROR_CONTACT_NAME_INVALID")
		void validateContactName_WithApostrophe_ThrowsInvalid() {
			ModuleException ex = assertThrows(ModuleException.class,
					() -> CrmValidations.validateContactName("O'Brien"));
			assertEquals(CrmMessageConstant.CRM_ERROR_CONTACT_NAME_INVALID, ex.getMessageKey());
		}

		@Test
		@DisplayName("Name with HTML injection characters - throws CRM_ERROR_CONTACT_NAME_INVALID")
		void validateContactName_WithHtmlChars_ThrowsInvalid() {
			ModuleException ex = assertThrows(ModuleException.class,
					() -> CrmValidations.validateContactName("<script>alert(1)</script>"));
			assertEquals(CrmMessageConstant.CRM_ERROR_CONTACT_NAME_INVALID, ex.getMessageKey());
		}

		@Test
		@DisplayName("Name with SQL injection characters - throws CRM_ERROR_CONTACT_NAME_INVALID")
		void validateContactName_WithSqlChars_ThrowsInvalid() {
			ModuleException ex = assertThrows(ModuleException.class,
					() -> CrmValidations.validateContactName("'; DROP TABLE contacts;--"));
			assertEquals(CrmMessageConstant.CRM_ERROR_CONTACT_NAME_INVALID, ex.getMessageKey());
		}

		@Test
		@DisplayName("Numeric-only name - throws CRM_ERROR_CONTACT_NAME_INVALID")
		void validateContactName_NumericOnly_ThrowsInvalid() {
			ModuleException ex = assertThrows(ModuleException.class, () -> CrmValidations.validateContactName("12345"));
			assertEquals(CrmMessageConstant.CRM_ERROR_CONTACT_NAME_INVALID, ex.getMessageKey());
		}

		@Test
		@DisplayName("Name with emoji - throws CRM_ERROR_CONTACT_NAME_INVALID")
		void validateContactName_WithEmoji_ThrowsInvalid() {
			ModuleException ex = assertThrows(ModuleException.class,
					() -> CrmValidations.validateContactName("John 😊"));
			assertEquals(CrmMessageConstant.CRM_ERROR_CONTACT_NAME_INVALID, ex.getMessageKey());
		}

		@Test
		@DisplayName("Name with special symbols - throws CRM_ERROR_CONTACT_NAME_INVALID")
		void validateContactName_WithSpecialSymbols_ThrowsInvalid() {
			ModuleException ex = assertThrows(ModuleException.class,
					() -> CrmValidations.validateContactName("John@Doe"));
			assertEquals(CrmMessageConstant.CRM_ERROR_CONTACT_NAME_INVALID, ex.getMessageKey());
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
