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
@DisplayName("CrmValidations Unit Tests")
class CrmValidationsTest {

	// --- validateCompanyName ---

	@Nested
	@DisplayName("validateCompanyName")
	class ValidateCompanyName {

		@Test
		@DisplayName("Blank name - throws CRM_ERROR_COMPANY_NAME_REQUIRED")
		void validateCompanyName_BlankName_ThrowsRequired() {
			ModuleException ex = assertThrows(ModuleException.class, () -> CrmValidations.validateCompanyName("   "));
			assertEquals(CrmMessageConstant.CRM_ERROR_COMPANY_NAME_REQUIRED, ex.getMessageKey());
		}

		@Test
		@DisplayName("Name exceeding max length - throws CRM_ERROR_COMPANY_NAME_TOO_LONG")
		void validateCompanyName_TooLong_ThrowsTooLong() {
			String tooLong = "A".repeat(CrmConstants.COMPANY_NAME_MAX_LENGTH + 1);
			ModuleException ex = assertThrows(ModuleException.class, () -> CrmValidations.validateCompanyName(tooLong));
			assertEquals(CrmMessageConstant.CRM_ERROR_COMPANY_NAME_TOO_LONG, ex.getMessageKey());
		}

		@Test
		@DisplayName("Valid name - does not throw")
		void validateCompanyName_ValidName_DoesNotThrow() {
			assertDoesNotThrow(() -> CrmValidations.validateCompanyName("Acme Corp"));
		}

	}

	// --- validateContactNumber ---

	@Nested
	@DisplayName("validateContactNumber")
	class ValidateContactNumber {

		@Test
		@DisplayName("Null contact number - does not throw")
		void validateContactNumber_Null_DoesNotThrow() {
			assertDoesNotThrow(() -> CrmValidations.validateContactNumber(null));
		}

		@Test
		@DisplayName("Blank contact number - does not throw")
		void validateContactNumber_Blank_DoesNotThrow() {
			assertDoesNotThrow(() -> CrmValidations.validateContactNumber(""));
		}

		@Test
		@DisplayName("Contact number exceeding max length - throws CRM_ERROR_CONTACT_NUMBER_INVALID")
		void validateContactNumber_TooLong_ThrowsInvalid() {
			String tooLong = "1".repeat(CrmConstants.PHONE_MAX_LENGTH + 1);
			ModuleException ex = assertThrows(ModuleException.class,
					() -> CrmValidations.validateContactNumber(tooLong));
			assertEquals(CrmMessageConstant.CRM_ERROR_CONTACT_NUMBER_INVALID, ex.getMessageKey());
		}

		@Test
		@DisplayName("Valid contact number - does not throw")
		void validateContactNumber_Valid_DoesNotThrow() {
			assertDoesNotThrow(() -> CrmValidations.validateContactNumber("94771234567"));
		}

	}

	// --- validateWebsite ---

	@Nested
	@DisplayName("validateWebsite")
	class ValidateWebsite {

		@Test
		@DisplayName("Null website - does not throw")
		void validateWebsite_Null_DoesNotThrow() {
			assertDoesNotThrow(() -> CrmValidations.validateWebsite(null));
		}

		@Test
		@DisplayName("Blank website - does not throw")
		void validateWebsite_Blank_DoesNotThrow() {
			assertDoesNotThrow(() -> CrmValidations.validateWebsite(""));
		}

		@Test
		@DisplayName("Invalid URL - throws CRM_ERROR_WEBSITE_INVALID")
		void validateWebsite_InvalidUrl_ThrowsInvalid() {
			ModuleException ex = assertThrows(ModuleException.class, () -> CrmValidations.validateWebsite("not-a-url"));
			assertEquals(CrmMessageConstant.CRM_ERROR_WEBSITE_INVALID, ex.getMessageKey());
		}

		@Test
		@DisplayName("Website exceeding max length - throws CRM_ERROR_WEBSITE_INVALID")
		void validateWebsite_TooLong_ThrowsInvalid() {
			String tooLong = "https://" + "a".repeat(CrmConstants.CHARACTER_MAX_LENGTH + 1) + ".com";
			ModuleException ex = assertThrows(ModuleException.class, () -> CrmValidations.validateWebsite(tooLong));
			assertEquals(CrmMessageConstant.CRM_ERROR_WEBSITE_INVALID, ex.getMessageKey());
		}

		@Test
		@DisplayName("Valid website URL - does not throw")
		void validateWebsite_ValidUrl_DoesNotThrow() {
			assertDoesNotThrow(() -> CrmValidations.validateWebsite("https://acme.com"));
		}

	}

	// --- validateAddress ---

	@Nested
	@DisplayName("validateAddress")
	class ValidateAddress {

		@Test
		@DisplayName("Null address - does not throw")
		void validateAddress_Null_DoesNotThrow() {
			assertDoesNotThrow(() -> CrmValidations.validateAddress(null));
		}

		@Test
		@DisplayName("Blank address - does not throw")
		void validateAddress_Blank_DoesNotThrow() {
			assertDoesNotThrow(() -> CrmValidations.validateAddress(""));
		}

		@Test
		@DisplayName("Address exceeding max length - throws CRM_ERROR_ADDRESS_TOO_LONG")
		void validateAddress_TooLong_ThrowsTooLong() {
			String tooLong = "A".repeat(CrmConstants.ADDRESS_MAX_LENGTH + 1);
			ModuleException ex = assertThrows(ModuleException.class, () -> CrmValidations.validateAddress(tooLong));
			assertEquals(CrmMessageConstant.CRM_ERROR_ADDRESS_TOO_LONG, ex.getMessageKey());
		}

		@Test
		@DisplayName("Valid address - does not throw")
		void validateAddress_Valid_DoesNotThrow() {
			assertDoesNotThrow(() -> CrmValidations.validateAddress("123 Main St"));
		}

	}

	// --- validateIndustry ---

	@Nested
	@DisplayName("validateIndustry")
	class ValidateIndustry {

		@Test
		@DisplayName("Null industry - does not throw")
		void validateIndustry_Null_DoesNotThrow() {
			assertDoesNotThrow(() -> CrmValidations.validateIndustry(null));
		}

		@Test
		@DisplayName("Blank industry - does not throw")
		void validateIndustry_Blank_DoesNotThrow() {
			assertDoesNotThrow(() -> CrmValidations.validateIndustry(""));
		}

		@Test
		@DisplayName("Industry exceeding max length - throws CRM_ERROR_INDUSTRY_TOO_LONG")
		void validateIndustry_TooLong_ThrowsTooLong() {
			String tooLong = "A".repeat(CrmConstants.CHARACTER_MAX_LENGTH + 1);
			ModuleException ex = assertThrows(ModuleException.class, () -> CrmValidations.validateIndustry(tooLong));
			assertEquals(CrmMessageConstant.CRM_ERROR_INDUSTRY_TOO_LONG, ex.getMessageKey());
		}

		@Test
		@DisplayName("Valid industry - does not throw")
		void validateIndustry_Valid_DoesNotThrow() {
			assertDoesNotThrow(() -> CrmValidations.validateIndustry("Technology"));
		}

	}

}
