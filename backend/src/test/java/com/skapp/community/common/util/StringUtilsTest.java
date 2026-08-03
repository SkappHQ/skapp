package com.skapp.community.common.util;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

@DisplayName("StringUtils Unit Tests")
class StringUtilsTest {

	@Nested
	@DisplayName("trimToEmpty")
	class TrimToEmpty {

		@Test
		@DisplayName("Null value - returns an empty string")
		void trimToEmpty_Null_ReturnsEmptyString() {
			assertEquals("", StringUtils.trimToEmpty(null));
		}

		@Test
		@DisplayName("Padded value - returns the trimmed value")
		void trimToEmpty_Padded_ReturnsTrimmedValue() {
			assertEquals("John Doe", StringUtils.trimToEmpty("  John Doe  "));
		}

	}

	@Nested
	@DisplayName("normalizeName")
	class NormalizeName {

		@Test
		@DisplayName("Null value - returns an empty string")
		void normalizeName_Null_ReturnsEmptyString() {
			assertEquals("", StringUtils.normalizeName(null));
		}

		@Test
		@DisplayName("Mixed case value - returns the lowercased value")
		void normalizeName_MixedCase_ReturnsLowercasedValue() {
			assertEquals("john doe", StringUtils.normalizeName("John Doe"));
		}

		@Test
		@DisplayName("Turkish dotted I - lowercases with the root locale")
		void normalizeName_DottedI_LowercasesWithRootLocale() {
			assertEquals("iris", StringUtils.normalizeName("IRIS"));
		}

		@Test
		@DisplayName("Accented value - strips the diacritics")
		void normalizeName_Accented_StripsDiacritics() {
			assertEquals("jose silva", StringUtils.normalizeName("José Silva"));
		}

		@Test
		@DisplayName("Decomposed value - matches its composed form")
		void normalizeName_Decomposed_MatchesComposedForm() {
			assertEquals(StringUtils.normalizeName("José Silva"), StringUtils.normalizeName("José Silva"));
		}

		@Test
		@DisplayName("Repeated and non-breaking whitespace - collapses into single spaces")
		void normalizeName_RepeatedWhitespace_CollapsesIntoSingleSpaces() {
			assertEquals("john doe", StringUtils.normalizeName("  John  Doe "));
		}

	}

}
