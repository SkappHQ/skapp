package com.skapp.community.common.util;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

@DisplayName("FractionalIndexUtil Unit Tests")
class FractionalIndexUtilTest {

	@Nested
	@DisplayName("generateKeyBetween - Both boundaries null")
	class GenerateKeyBetweenBothNull {

		@Test
		@DisplayName("Both a and b are null - returns valid key")
		void generateKeyBetween_BothNull_ReturnsValidKey() {
			String result = FractionalIndexUtil.generateKeyBetween(null, null);
			assertNotNull(result);
			assertEquals("a0", result);
		}

	}

	@Nested
	@DisplayName("generateKeyBetween - Only a is null")
	class GenerateKeyBetweenOnlyANull {

		@Test
		@DisplayName("a is null, b is valid - returns key less than b")
		void generateKeyBetween_ANull_ReturnsKeyLessThanB() {
			String b = "b00";
			String result = FractionalIndexUtil.generateKeyBetween(null, b);
			assertNotNull(result);
			assertTrue(result.compareTo(b) < 0);
		}

		@Test
		@DisplayName("a is null, b is Z0 - returns key less than Z0")
		void generateKeyBetween_ANull_BIsZ0_ReturnsKey() {
			String b = "Z0";
			String result = FractionalIndexUtil.generateKeyBetween(null, b);
			assertNotNull(result);
			assertTrue(result.compareTo(b) < 0);
		}

		@Test
		@DisplayName("a is null, b has fractional part - generates valid key")
		void generateKeyBetween_ANull_BHasFractional_ReturnsKey() {
			String b = "a0a";
			String result = FractionalIndexUtil.generateKeyBetween(null, b);
			assertNotNull(result);
			assertTrue(result.compareTo(b) < 0);
		}

	}

	@Nested
	@DisplayName("generateKeyBetween - Only b is null")
	class GenerateKeyBetweenOnlyBNull {

		@Test
		@DisplayName("a is valid, b is null - returns key greater than a")
		void generateKeyBetween_BNull_ReturnsKeyGreaterThanA() {
			String a = "a0";
			String result = FractionalIndexUtil.generateKeyBetween(a, null);
			assertNotNull(result);
			assertTrue(result.compareTo(a) > 0);
		}

		@Test
		@DisplayName("a has fractional part, b is null - returns valid key")
		void generateKeyBetween_AHasFractional_BNull_ReturnsKey() {
			String a = "a0a";
			String result = FractionalIndexUtil.generateKeyBetween(a, null);
			assertNotNull(result);
			assertTrue(result.compareTo(a) > 0);
		}

	}

	@Nested
	@DisplayName("generateKeyBetween - Both boundaries provided")
	class GenerateKeyBetweenBothProvided {

		@Test
		@DisplayName("Simple case - a and b differ in first digit")
		void generateKeyBetween_SimpleDifferentFirstDigit_ReturnsValidKey() {
			String a = "a0";
			String b = "c000";
			String result = FractionalIndexUtil.generateKeyBetween(a, b);
			assertNotNull(result);
			assertTrue(result.compareTo(a) > 0);
			assertTrue(result.compareTo(b) < 0);
		}

		@Test
		@DisplayName("Complex case - same integer part, different fractional")
		void generateKeyBetween_SameIntegerDifferentFractional_ReturnsValidKey() {
			String a = "a0a";
			String b = "a0b";
			String result = FractionalIndexUtil.generateKeyBetween(a, b);
			assertNotNull(result);
			assertTrue(result.compareTo(a) > 0);
			assertTrue(result.compareTo(b) < 0);
		}

		@Test
		@DisplayName("Adjacent integers - returns decimal between them")
		void generateKeyBetween_AdjacentIntegers_ReturnsDecimal() {
			String a = "a0";
			String b = "b00";
			String result = FractionalIndexUtil.generateKeyBetween(a, b);
			assertNotNull(result);
			assertTrue(result.compareTo(a) > 0);
			assertTrue(result.compareTo(b) < 0);
		}

		@Test
		@DisplayName("Same prefix - generates fractional part")
		void generateKeyBetween_SamePrefix_GeneratesFractional() {
			String a = "a0a";
			String b = "a0c";
			String result = FractionalIndexUtil.generateKeyBetween(a, b);
			assertNotNull(result);
			assertTrue(result.startsWith("a0"));
			assertTrue(result.compareTo(a) > 0);
			assertTrue(result.compareTo(b) < 0);
		}

		@Test
		@DisplayName("Very close values - still generates valid key")
		void generateKeyBetween_VeryClose_ReturnsValidKey() {
			String a = "a0";
			String b = "a1";
			String result = FractionalIndexUtil.generateKeyBetween(a, b);
			assertNotNull(result);
			assertTrue(result.compareTo(a) > 0);
			assertTrue(result.compareTo(b) < 0);
		}

	}

	@Nested
	@DisplayName("generateKeyBetween - Custom digits")
	class GenerateKeyBetweenCustomDigits {

		@Test
		@DisplayName("Custom digit set - generates key correctly")
		void generateKeyBetween_CustomDigits_ReturnsValidKey() {
			String digits = "0123456789";
			String result = FractionalIndexUtil.generateKeyBetween(null, null, digits);
			assertNotNull(result);
		}

		@Test
		@DisplayName("Custom digits between two values - returns valid key")
		void generateKeyBetween_CustomDigitsBetweenValues_ReturnsValidKey() {
			String digits = "01";
			String a = FractionalIndexUtil.generateKeyBetween(null, null, digits);
			String b = FractionalIndexUtil.generateKeyBetween(a, null, digits);
			String result = FractionalIndexUtil.generateKeyBetween(a, b, digits);
			assertNotNull(result);
			assertTrue(result.compareTo(a) > 0);
			assertTrue(result.compareTo(b) < 0);
		}

	}

	@Nested
	@DisplayName("generateKeyBetween - Error cases")
	class GenerateKeyBetweenErrorCases {

		@Test
		@DisplayName("a >= b - throws IllegalArgumentException")
		void generateKeyBetween_AGreaterThanB_ThrowsException() {
			String a = "b0";
			String b = "a0";
			assertThrows(IllegalArgumentException.class, () -> FractionalIndexUtil.generateKeyBetween(a, b));
		}

		@Test
		@DisplayName("a equals b - throws IllegalArgumentException")
		void generateKeyBetween_AEqualsB_ThrowsException() {
			String value = "a0";
			assertThrows(IllegalArgumentException.class, () -> FractionalIndexUtil.generateKeyBetween(value, value));
		}

		@Test
		@DisplayName("Invalid key with trailing zero - throws IllegalArgumentException")
		void generateKeyBetween_InvalidKeyTrailingZero_ThrowsException() {
			assertThrows(IllegalArgumentException.class, () -> FractionalIndexUtil.generateKeyBetween("a0", "b0"));
		}

		@Test
		@DisplayName("Invalid order key head - throws IllegalArgumentException")
		void generateKeyBetween_InvalidKeyHead_ThrowsException() {
			assertThrows(IllegalArgumentException.class, () -> FractionalIndexUtil.generateKeyBetween("10", "b0"));
		}

	}

	@Nested
	@DisplayName("generateKeyBetween - Multiple insertions")
	class GenerateKeyBetweenMultipleInsertions {

		@Test
		@DisplayName("Multiple insertions maintain order")
		void generateKeyBetween_MultipleInsertions_MaintainOrder() {
			String key1 = FractionalIndexUtil.generateKeyBetween(null, null);
			String key2 = FractionalIndexUtil.generateKeyBetween(key1, null);
			String key3 = FractionalIndexUtil.generateKeyBetween(null, key1);
			String key4 = FractionalIndexUtil.generateKeyBetween(key3, key1);

			assertTrue(key3.compareTo(key1) < 0);
			assertTrue(key1.compareTo(key2) < 0);
			assertTrue(key3.compareTo(key4) < 0);
			assertTrue(key4.compareTo(key1) < 0);
		}

		@Test
		@DisplayName("Insert between various positions maintains order")
		void generateKeyBetween_InsertBetweenVariousPositions_MaintainsOrder() {
			String a = FractionalIndexUtil.generateKeyBetween(null, null);
			String b = FractionalIndexUtil.generateKeyBetween(a, null);
			String c = FractionalIndexUtil.generateKeyBetween(b, null);

			String betweenAB = FractionalIndexUtil.generateKeyBetween(a, b);
			String betweenBC = FractionalIndexUtil.generateKeyBetween(b, c);
			String betweenABC = FractionalIndexUtil.generateKeyBetween(betweenAB, betweenBC);

			assertTrue(a.compareTo(betweenAB) < 0);
			assertTrue(betweenAB.compareTo(b) < 0);
			assertTrue(b.compareTo(betweenBC) < 0);
			assertTrue(betweenBC.compareTo(c) < 0);
			assertTrue(betweenAB.compareTo(betweenABC) < 0);
			assertTrue(betweenABC.compareTo(betweenBC) < 0);
		}

	}

	@Nested
	@DisplayName("Base62 constant")
	class Base62Constant {

		@Test
		@DisplayName("BASE_62_DIGITS constant is properly defined")
		void base62Digits_ProperlyDefined() {
			assertEquals(62, FractionalIndexUtil.BASE_62_DIGITS.length());
			assertEquals("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
					FractionalIndexUtil.BASE_62_DIGITS);
		}

	}

}
