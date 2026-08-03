package com.skapp.community.leaveplanner.util;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

@DisplayName("EmployeeLeavePolicyUtil Unit Tests")
class EmployeeLeavePolicyUtilTest {

	@Nested
	@DisplayName("parseBulkEffectiveDate")
	class ParseBulkEffectiveDate {

		@Test
		@DisplayName("Valid dd/MM/uuuu value - returns the parsed date")
		void parseBulkEffectiveDate_ValidValue_ReturnsParsedDate() {
			assertEquals(LocalDate.of(2026, 6, 1), EmployeeLeavePolicyUtil.parseBulkEffectiveDate("01/06/2026"));
		}

		@Test
		@DisplayName("Padded value - returns the parsed date")
		void parseBulkEffectiveDate_PaddedValue_ReturnsParsedDate() {
			assertEquals(LocalDate.of(2026, 6, 1), EmployeeLeavePolicyUtil.parseBulkEffectiveDate(" 01/06/2026 "));
		}

		@Test
		@DisplayName("Null or blank value - returns null")
		void parseBulkEffectiveDate_NullOrBlank_ReturnsNull() {
			assertNull(EmployeeLeavePolicyUtil.parseBulkEffectiveDate(null));
			assertNull(EmployeeLeavePolicyUtil.parseBulkEffectiveDate("   "));
		}

		@Test
		@DisplayName("Non-existent calendar date - returns null under the strict resolver")
		void parseBulkEffectiveDate_NonExistentDate_ReturnsNull() {
			assertNull(EmployeeLeavePolicyUtil.parseBulkEffectiveDate("31/02/2026"));
			assertNull(EmployeeLeavePolicyUtil.parseBulkEffectiveDate("32/13/2026"));
		}

		@Test
		@DisplayName("Wrong format - returns null")
		void parseBulkEffectiveDate_WrongFormat_ReturnsNull() {
			assertNull(EmployeeLeavePolicyUtil.parseBulkEffectiveDate("2026-06-01"));
			assertNull(EmployeeLeavePolicyUtil.parseBulkEffectiveDate("06/2026"));
		}

	}

}
