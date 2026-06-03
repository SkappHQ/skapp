package com.skapp.community.common.util;

import lombok.experimental.UtilityClass;

@UtilityClass
public class FractionalIndexUtil {

	public static final String BASE_62_DIGITS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

	private static String midpoint(String a, String b, String digits) {
		char zero = digits.charAt(0);

		if (b != null && a.compareTo(b) >= 0) {
			throw new IllegalArgumentException(a + " >= " + b);
		}

		if ((a.isEmpty() ? "" : a.substring(a.length() - 1)).equals(String.valueOf(zero))
				|| (b != null && (b.isEmpty() ? "" : b.substring(b.length() - 1)).equals(String.valueOf(zero)))) {
			throw new IllegalArgumentException("trailing zero");
		}

		if (b != null) {
			int n = 0;
			while (n < a.length() && n < b.length()
					&& (n >= a.length() ? zero : a.charAt(n)) == (n >= b.length() ? zero : b.charAt(n))) {
				n++;
			}
			if (n > 0) {
				return b.substring(0, n) + midpoint(a.substring(n), b.substring(n), digits);
			}
		}

		int digitA = a.isEmpty() ? 0 : digits.indexOf(a.charAt(0));
		int digitB = b == null ? digits.length() : digits.indexOf(b.charAt(0));

		if (digitB - digitA > 1) {
			int midDigit = Math.round(0.5f * (digitA + digitB));
			return String.valueOf(digits.charAt(midDigit));
		}
		else {
			if (b != null && b.length() > 1) {
				return b.substring(0, 1);
			}
			else {
				return String.valueOf(a.isEmpty() ? zero : a.charAt(0))
						+ midpoint(a.substring(Math.min(1, a.length())), null, digits);
			}
		}
	}

	private static void validateInteger(String integerPart) {
		if (integerPart.length() != getIntegerLength(integerPart.charAt(0))) {
			throw new IllegalArgumentException("invalid integer part of order key: " + integerPart);
		}
	}

	private static int getIntegerLength(char head) {
		if (head >= 'a' && head <= 'z') {
			return head - 'a' + 2;
		}
		else if (head >= 'A' && head <= 'Z') {
			return 'Z' - head + 2;
		}
		else {
			throw new IllegalArgumentException("invalid order key head: " + head);
		}
	}

	private static String getIntegerPart(String key) {
		int integerPartLength = getIntegerLength(key.charAt(0));
		if (integerPartLength > key.length()) {
			throw new IllegalArgumentException("invalid order key: " + key);
		}
		return key.substring(0, integerPartLength);
	}

	private static void validateOrderKey(String key, String digits) {
		String expectedMin = "A" + String.valueOf(digits.charAt(0)).repeat(26);
		if (key.equals(expectedMin)) {
			throw new IllegalArgumentException("invalid order key: " + key);
		}

		String intPart = getIntegerPart(key);
		String fracPart = key.substring(intPart.length());

		if (!fracPart.isEmpty() && fracPart.substring(fracPart.length() - 1).equals(String.valueOf(digits.charAt(0)))) {
			throw new IllegalArgumentException("invalid order key: " + key);
		}
	}

	private static String incrementInteger(String x, String digits) {
		validateInteger(x);

		char[] chars = x.toCharArray();
		char head = chars[0];
		char[] digs = new char[chars.length - 1];
		System.arraycopy(chars, 1, digs, 0, digs.length);

		boolean carry = true;
		for (int i = digs.length - 1; carry && i >= 0; i--) {
			int d = digits.indexOf(digs[i]) + 1;
			if (d == digits.length()) {
				digs[i] = digits.charAt(0);
			}
			else {
				digs[i] = digits.charAt(d);
				carry = false;
			}
		}

		if (carry) {
			if (head == 'Z') {
				return "a" + digits.charAt(0);
			}
			if (head == 'z') {
				return null;
			}

			char h = (char) (head + 1);
			String digStr = new String(digs);

			if (h > 'a') {
				digStr = digStr + digits.charAt(0);
			}
			else {
				digStr = digStr.substring(0, Math.max(0, digStr.length() - 1));
			}

			return h + digStr;
		}
		else {
			return head + new String(digs);
		}
	}

	private static String decrementInteger(String x, String digits) {
		validateInteger(x);

		char[] chars = x.toCharArray();
		char head = chars[0];
		char[] digs = new char[chars.length - 1];
		System.arraycopy(chars, 1, digs, 0, digs.length);

		boolean borrow = true;
		for (int i = digs.length - 1; borrow && i >= 0; i--) {
			int d = digits.indexOf(digs[i]) - 1;
			if (d == -1) {
				digs[i] = digits.charAt(digits.length() - 1);
			}
			else {
				digs[i] = digits.charAt(d);
				borrow = false;
			}
		}

		if (borrow) {
			if (head == 'a') {
				return "Z" + digits.charAt(digits.length() - 1);
			}
			if (head == 'A') {
				return null;
			}

			char h = (char) (head - 1);
			String digStr = new String(digs);

			if (h < 'Z') {
				digStr = digStr + digits.charAt(digits.length() - 1);
			}
			else {
				digStr = digStr.substring(0, Math.max(0, digStr.length() - 1));
			}

			return h + digStr;
		}
		else {
			return head + new String(digs);
		}
	}

	public static String generateKeyBetween(String a, String b) {
		return generateKeyBetween(a, b, BASE_62_DIGITS);
	}

	public static String generateKeyBetween(String a, String b, String digits) {
		if (a != null) {
			validateOrderKey(a, digits);
		}
		if (b != null) {
			validateOrderKey(b, digits);
		}
		if (a != null && b != null && a.compareTo(b) >= 0) {
			throw new IllegalArgumentException(a + " >= " + b);
		}

		if (a == null) {
			if (b == null) {
				return "a" + digits.charAt(0);
			}

			String ib = getIntegerPart(b);
			String fb = b.substring(ib.length());

			String expectedMin = "A" + String.valueOf(digits.charAt(0)).repeat(26);
			if (ib.equals(expectedMin)) {
				return ib + midpoint("", fb, digits);
			}

			if (ib.compareTo(b) < 0) {
				return ib;
			}

			String res = decrementInteger(ib, digits);
			if (res == null) {
				throw new IllegalArgumentException("cannot decrement any more");
			}
			return res;
		}

		if (b == null) {
			String ia = getIntegerPart(a);
			String fa = a.substring(ia.length());
			String i = incrementInteger(ia, digits);
			return i == null ? ia + midpoint(fa, null, digits) : i;
		}

		String ia = getIntegerPart(a);
		String fa = a.substring(ia.length());
		String ib = getIntegerPart(b);
		String fb = b.substring(ib.length());

		if (ia.equals(ib)) {
			return ia + midpoint(fa, fb, digits);
		}

		String i = incrementInteger(ia, digits);
		if (i == null) {
			throw new IllegalArgumentException("cannot increment any more");
		}

		if (i.compareTo(b) < 0) {
			return i;
		}

		return ia + midpoint(fa, null, digits);
	}

}
