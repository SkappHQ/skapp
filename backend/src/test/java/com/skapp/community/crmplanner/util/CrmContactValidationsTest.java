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
	@DisplayName("validateContactFirstName")
	class ValidateContactFirstName {

		@Test
		@DisplayName("Blank first name - throws CRM_ERROR_CONTACT_FIRST_NAME_REQUIRED")
		void validateContactFirstName_BlankName_ThrowsRequired() {
			ModuleException ex = assertThrows(ModuleException.class,
					() -> CrmValidations.validateContactFirstName("   "));
			assertEquals(CrmMessageConstant.CRM_ERROR_CONTACT_FIRST_NAME_REQUIRED, ex.getMessageKey());
		}

		@Test
		@DisplayName("Null first name - throws CRM_ERROR_CONTACT_FIRST_NAME_REQUIRED")
		void validateContactFirstName_NullName_ThrowsRequired() {
			ModuleException ex = assertThrows(ModuleException.class,
					() -> CrmValidations.validateContactFirstName(null));
			assertEquals(CrmMessageConstant.CRM_ERROR_CONTACT_FIRST_NAME_REQUIRED, ex.getMessageKey());
		}

		@Test
		@DisplayName("First name exceeding max length - throws CRM_ERROR_CONTACT_FIRST_NAME_TOO_LONG")
		void validateContactFirstName_TooLong_ThrowsTooLong() {
			String tooLong = "A".repeat(CrmConstants.CONTACT_NAME_MAX_LENGTH + 1);
			ModuleException ex = assertThrows(ModuleException.class,
					() -> CrmValidations.validateContactFirstName(tooLong));
			assertEquals(CrmMessageConstant.CRM_ERROR_CONTACT_FIRST_NAME_TOO_LONG, ex.getMessageKey());
		}

		@Test
		@DisplayName("Valid first name - does not throw")
		void validateContactFirstName_ValidName_DoesNotThrow() {
			assertDoesNotThrow(() -> CrmValidations.validateContactFirstName("Jane"));
		}

		@Test
		@DisplayName("First name with hyphen - does not throw")
		void validateContactFirstName_WithHyphen_DoesNotThrow() {
			assertDoesNotThrow(() -> CrmValidations.validateContactFirstName("Mary-Jane"));
		}

		@Test
		@DisplayName("First name with period - does not throw")
		void validateContactFirstName_WithPeriod_DoesNotThrow() {
			assertDoesNotThrow(() -> CrmValidations.validateContactFirstName("Dr. John"));
		}

		@Test
		@DisplayName("First name with comma - throws CRM_ERROR_CONTACT_FIRST_NAME_INVALID")
		void validateContactFirstName_WithComma_ThrowsInvalid() {
			ModuleException ex = assertThrows(ModuleException.class,
					() -> CrmValidations.validateContactFirstName("Smith, John"));
			assertEquals(CrmMessageConstant.CRM_ERROR_CONTACT_FIRST_NAME_INVALID, ex.getMessageKey());
		}

		@Test
		@DisplayName("Unicode first name - does not throw")
		void validateContactFirstName_UnicodeName_DoesNotThrow() {
			assertDoesNotThrow(() -> CrmValidations.validateContactFirstName("Ångström"));
		}

		@Test
		@DisplayName("First name with apostrophe - does not throw")
		void validateContactFirstName_WithApostrophe_DoesNotThrow() {
			assertDoesNotThrow(() -> CrmValidations.validateContactFirstName("O'Brien"));
		}

		@Test
		@DisplayName("First name with HTML injection characters - throws CRM_ERROR_CONTACT_FIRST_NAME_INVALID")
		void validateContactFirstName_WithHtmlChars_ThrowsInvalid() {
			ModuleException ex = assertThrows(ModuleException.class,
					() -> CrmValidations.validateContactFirstName("<script>alert(1)</script>"));
			assertEquals(CrmMessageConstant.CRM_ERROR_CONTACT_FIRST_NAME_INVALID, ex.getMessageKey());
		}

		@Test
		@DisplayName("First name with SQL injection characters - throws CRM_ERROR_CONTACT_FIRST_NAME_INVALID")
		void validateContactFirstName_WithSqlChars_ThrowsInvalid() {
			ModuleException ex = assertThrows(ModuleException.class,
					() -> CrmValidations.validateContactFirstName("'; DROP TABLE contacts;--"));
			assertEquals(CrmMessageConstant.CRM_ERROR_CONTACT_FIRST_NAME_INVALID, ex.getMessageKey());
		}

		@Test
		@DisplayName("Numeric-only first name - throws CRM_ERROR_CONTACT_FIRST_NAME_INVALID")
		void validateContactFirstName_NumericOnly_ThrowsInvalid() {
			ModuleException ex = assertThrows(ModuleException.class,
					() -> CrmValidations.validateContactFirstName("12345"));
			assertEquals(CrmMessageConstant.CRM_ERROR_CONTACT_FIRST_NAME_INVALID, ex.getMessageKey());
		}

		@Test
		@DisplayName("First name with emoji - throws CRM_ERROR_CONTACT_FIRST_NAME_INVALID")
		void validateContactFirstName_WithEmoji_ThrowsInvalid() {
			ModuleException ex = assertThrows(ModuleException.class,
					() -> CrmValidations.validateContactFirstName("John 😊"));
			assertEquals(CrmMessageConstant.CRM_ERROR_CONTACT_FIRST_NAME_INVALID, ex.getMessageKey());
		}

		@Test
		@DisplayName("First name with special symbols - throws CRM_ERROR_CONTACT_FIRST_NAME_INVALID")
		void validateContactFirstName_WithSpecialSymbols_ThrowsInvalid() {
			ModuleException ex = assertThrows(ModuleException.class,
					() -> CrmValidations.validateContactFirstName("John@Doe"));
			assertEquals(CrmMessageConstant.CRM_ERROR_CONTACT_FIRST_NAME_INVALID, ex.getMessageKey());
		}

	}

	@Nested
	@DisplayName("validateContactLastName")
	class ValidateContactLastName {

		@Test
		@DisplayName("Blank last name - does not throw (optional)")
		void validateContactLastName_BlankName_DoesNotThrow() {
			assertDoesNotThrow(() -> CrmValidations.validateContactLastName("   "));
		}

		@Test
		@DisplayName("Null last name - does not throw (optional)")
		void validateContactLastName_NullName_DoesNotThrow() {
			assertDoesNotThrow(() -> CrmValidations.validateContactLastName(null));
		}

		@Test
		@DisplayName("Last name exceeding max length - throws CRM_ERROR_CONTACT_LAST_NAME_TOO_LONG")
		void validateContactLastName_TooLong_ThrowsTooLong() {
			String tooLong = "A".repeat(CrmConstants.CONTACT_NAME_MAX_LENGTH + 1);
			ModuleException ex = assertThrows(ModuleException.class,
					() -> CrmValidations.validateContactLastName(tooLong));
			assertEquals(CrmMessageConstant.CRM_ERROR_CONTACT_LAST_NAME_TOO_LONG, ex.getMessageKey());
		}

		@Test
		@DisplayName("Valid last name - does not throw")
		void validateContactLastName_ValidName_DoesNotThrow() {
			assertDoesNotThrow(() -> CrmValidations.validateContactLastName("Cooper"));
		}

		@Test
		@DisplayName("Last name with hyphen - does not throw")
		void validateContactLastName_WithHyphen_DoesNotThrow() {
			assertDoesNotThrow(() -> CrmValidations.validateContactLastName("Watson-Jones"));
		}

		@Test
		@DisplayName("Unicode last name - does not throw")
		void validateContactLastName_UnicodeName_DoesNotThrow() {
			assertDoesNotThrow(() -> CrmValidations.validateContactLastName("Müller"));
		}

		@Test
		@DisplayName("Last name with apostrophe - does not throw")
		void validateContactLastName_WithApostrophe_DoesNotThrow() {
			assertDoesNotThrow(() -> CrmValidations.validateContactLastName("O'Brien"));
		}

		@Test
		@DisplayName("Last name with comma - throws CRM_ERROR_CONTACT_LAST_NAME_INVALID")
		void validateContactLastName_WithComma_ThrowsInvalid() {
			ModuleException ex = assertThrows(ModuleException.class,
					() -> CrmValidations.validateContactLastName("Smith, Jr"));
			assertEquals(CrmMessageConstant.CRM_ERROR_CONTACT_LAST_NAME_INVALID, ex.getMessageKey());
		}

		@Test
		@DisplayName("Last name with HTML injection characters - throws CRM_ERROR_CONTACT_LAST_NAME_INVALID")
		void validateContactLastName_WithHtmlChars_ThrowsInvalid() {
			ModuleException ex = assertThrows(ModuleException.class,
					() -> CrmValidations.validateContactLastName("<script>alert(1)</script>"));
			assertEquals(CrmMessageConstant.CRM_ERROR_CONTACT_LAST_NAME_INVALID, ex.getMessageKey());
		}

		@Test
		@DisplayName("Numeric-only last name - throws CRM_ERROR_CONTACT_LAST_NAME_INVALID")
		void validateContactLastName_NumericOnly_ThrowsInvalid() {
			ModuleException ex = assertThrows(ModuleException.class,
					() -> CrmValidations.validateContactLastName("12345"));
			assertEquals(CrmMessageConstant.CRM_ERROR_CONTACT_LAST_NAME_INVALID, ex.getMessageKey());
		}

		@Test
		@DisplayName("Last name with special symbols - throws CRM_ERROR_CONTACT_LAST_NAME_INVALID")
		void validateContactLastName_WithSpecialSymbols_ThrowsInvalid() {
			ModuleException ex = assertThrows(ModuleException.class,
					() -> CrmValidations.validateContactLastName("Doe@Smith"));
			assertEquals(CrmMessageConstant.CRM_ERROR_CONTACT_LAST_NAME_INVALID, ex.getMessageKey());
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
