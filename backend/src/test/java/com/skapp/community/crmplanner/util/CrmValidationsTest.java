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
import static org.junit.jupiter.api.Assertions.assertNull;
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

	// --- normalizeIndustryName ---

	@Nested
	@DisplayName("normalizeIndustryName")
	class NormalizeIndustryName {

		@Test
		@DisplayName("Null name - returns null")
		void normalizeIndustryName_Null_ReturnsNull() {
			assertNull(CrmValidations.normalizeIndustryName(null));
		}

		@Test
		@DisplayName("Surrounding whitespace - is trimmed")
		void normalizeIndustryName_SurroundingWhitespace_IsTrimmed() {
			assertEquals("Retail", CrmValidations.normalizeIndustryName("   Retail   "));
		}

		@Test
		@DisplayName("Repeated internal whitespace - collapses to a single space")
		void normalizeIndustryName_InternalWhitespace_Collapses() {
			assertEquals("Real Estate", CrmValidations.normalizeIndustryName("Real     Estate"));
		}

		@Test
		@DisplayName("Tabs and newlines between words - collapse to a single space")
		void normalizeIndustryName_MixedWhitespace_Collapses() {
			assertEquals("Oil Gas And Mining", CrmValidations.normalizeIndustryName("Oil\tGas\nAnd  Mining"));
		}

		@Test
		@DisplayName("Already normalized name - is returned unchanged")
		void normalizeIndustryName_AlreadyNormalized_ReturnsUnchanged() {
			assertEquals("Financial Services", CrmValidations.normalizeIndustryName("Financial Services"));
		}

		@Test
		@DisplayName("Casing is preserved - only whitespace is normalized")
		void normalizeIndustryName_PreservesCasing() {
			assertEquals("eCommerce & B2B", CrmValidations.normalizeIndustryName("  eCommerce   & B2B "));
		}

	}

	// --- validateIndustryName ---

	@Nested
	@DisplayName("validateIndustryName")
	class ValidateIndustryName {

		@Test
		@DisplayName("Null name - throws CRM_ERROR_INDUSTRY_NAME_REQUIRED")
		void validateIndustryName_Null_ThrowsRequired() {
			ModuleException ex = assertThrows(ModuleException.class, () -> CrmValidations.validateIndustryName(null));
			assertEquals(CrmMessageConstant.CRM_ERROR_INDUSTRY_NAME_REQUIRED, ex.getMessageKey());
		}

		@Test
		@DisplayName("Whitespace-only name - throws CRM_ERROR_INDUSTRY_NAME_REQUIRED")
		void validateIndustryName_WhitespaceOnly_ThrowsRequired() {
			ModuleException ex = assertThrows(ModuleException.class, () -> CrmValidations.validateIndustryName("    "));
			assertEquals(CrmMessageConstant.CRM_ERROR_INDUSTRY_NAME_REQUIRED, ex.getMessageKey());
		}

		@Test
		@DisplayName("Name exceeding max length - throws CRM_ERROR_INDUSTRY_NAME_TOO_LONG")
		void validateIndustryName_TooLong_ThrowsTooLong() {
			String tooLong = "A".repeat(CrmConstants.INDUSTRY_NAME_MAX_LENGTH + 1);
			ModuleException ex = assertThrows(ModuleException.class,
					() -> CrmValidations.validateIndustryName(tooLong));
			assertEquals(CrmMessageConstant.CRM_ERROR_INDUSTRY_NAME_TOO_LONG, ex.getMessageKey());
		}

		@Test
		@DisplayName("Name at exactly max length - does not throw")
		void validateIndustryName_AtMaxLength_DoesNotThrow() {
			String maxLength = "A".repeat(CrmConstants.INDUSTRY_NAME_MAX_LENGTH);
			assertDoesNotThrow(() -> CrmValidations.validateIndustryName(maxLength));
		}

		@Test
		@DisplayName("Length is measured after normalization - padded max-length name does not throw")
		void validateIndustryName_LengthMeasuredAfterNormalization_DoesNotThrow() {
			String padded = "  " + "A".repeat(CrmConstants.INDUSTRY_NAME_MAX_LENGTH) + "  ";
			assertDoesNotThrow(() -> CrmValidations.validateIndustryName(padded));
		}

		@Test
		@DisplayName("Valid name - does not throw")
		void validateIndustryName_ValidName_DoesNotThrow() {
			assertDoesNotThrow(() -> CrmValidations.validateIndustryName("Renewable Energy"));
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
