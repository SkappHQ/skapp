package com.skapp.community.crmplanner.util;

import com.skapp.TestSkappApplication;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.crmplanner.constant.CrmConstants;
import com.skapp.community.crmplanner.constant.CrmMessageConstant;
import com.skapp.community.crmplanner.type.CrmIndustry;
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
		@DisplayName("Contact number with no country code separator - throws CRM_ERROR_CONTACT_NUMBER_INVALID")
		void validateContactNumber_NoSpace_ThrowsInvalid() {
			ModuleException ex = assertThrows(ModuleException.class,
					() -> CrmValidations.validateContactNumber("94771234567"));
			assertEquals(CrmMessageConstant.CRM_ERROR_CONTACT_NUMBER_INVALID, ex.getMessageKey());
		}

		@Test
		@DisplayName("Contact number with more than one space - throws CRM_ERROR_CONTACT_NUMBER_INVALID")
		void validateContactNumber_MultipleSpaces_ThrowsInvalid() {
			ModuleException ex = assertThrows(ModuleException.class,
					() -> CrmValidations.validateContactNumber("94 771 234567"));
			assertEquals(CrmMessageConstant.CRM_ERROR_CONTACT_NUMBER_INVALID, ex.getMessageKey());
		}

		@Test
		@DisplayName("Country code exceeding 4 digits - throws CRM_ERROR_CONTACT_NUMBER_INVALID")
		void validateContactNumber_CountryCodeTooLong_ThrowsInvalid() {
			ModuleException ex = assertThrows(ModuleException.class,
					() -> CrmValidations.validateContactNumber("94123 771234567"));
			assertEquals(CrmMessageConstant.CRM_ERROR_CONTACT_NUMBER_INVALID, ex.getMessageKey());
		}

		@Test
		@DisplayName("Number containing non-digit characters - throws CRM_ERROR_CONTACT_NUMBER_INVALID")
		void validateContactNumber_NonNumericNumber_ThrowsInvalid() {
			ModuleException ex = assertThrows(ModuleException.class,
					() -> CrmValidations.validateContactNumber("94 77-123-4567"));
			assertEquals(CrmMessageConstant.CRM_ERROR_CONTACT_NUMBER_INVALID, ex.getMessageKey());
		}

		@Test
		@DisplayName("Number exceeding max length - throws CRM_ERROR_CONTACT_NUMBER_INVALID")
		void validateContactNumber_NumberTooLong_ThrowsInvalid() {
			String tooLongNumber = "1".repeat(CrmConstants.PHONE_MAX_LENGTH + 1);
			ModuleException ex = assertThrows(ModuleException.class,
					() -> CrmValidations.validateContactNumber("94 " + tooLongNumber));
			assertEquals(CrmMessageConstant.CRM_ERROR_CONTACT_NUMBER_INVALID, ex.getMessageKey());
		}

		@Test
		@DisplayName("Valid country code and number - does not throw")
		void validateContactNumber_Valid_DoesNotThrow() {
			assertDoesNotThrow(() -> CrmValidations.validateContactNumber("94 771234567"));
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

		@Test
		@DisplayName("Insecure http URL - throws CRM_ERROR_WEBSITE_INVALID")
		void validateWebsite_HttpUrl_ThrowsInvalid() {
			ModuleException ex = assertThrows(ModuleException.class,
					() -> CrmValidations.validateWebsite("http://acme.com"));
			assertEquals(CrmMessageConstant.CRM_ERROR_WEBSITE_INVALID, ex.getMessageKey());
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

	// --- validateDomain ---

	@Nested
	@DisplayName("validateDomain")
	class ValidateDomain {

		@Test
		@DisplayName("Blank domain - throws CRM_ERROR_DOMAIN_REQUIRED")
		void validateDomain_Blank_ThrowsRequired() {
			ModuleException ex = assertThrows(ModuleException.class, () -> CrmValidations.validateDomain("   "));
			assertEquals(CrmMessageConstant.CRM_ERROR_DOMAIN_REQUIRED, ex.getMessageKey());
		}

		@Test
		@DisplayName("Valid domain - does not throw")
		void validateDomain_Valid_DoesNotThrow() {
			assertDoesNotThrow(() -> CrmValidations.validateDomain("acme.com"));
		}

	}

	// --- validateIndustry ---

	@Nested
	@DisplayName("validateIndustry")
	class ValidateIndustry {

		@Test
		@DisplayName("Null industry - throws CRM_ERROR_INDUSTRY_INVALID")
		void validateIndustry_Null_ThrowsInvalid() {
			ModuleException ex = assertThrows(ModuleException.class, () -> CrmValidations.validateIndustry(null));
			assertEquals(CrmMessageConstant.CRM_ERROR_INDUSTRY_INVALID, ex.getMessageKey());
		}

		@Test
		@DisplayName("Valid industry - does not throw")
		void validateIndustry_Valid_DoesNotThrow() {
			assertDoesNotThrow(() -> CrmValidations.validateIndustry(CrmIndustry.TECHNOLOGY_INFORMATION_AND_MEDIA));
		}

	}

}
