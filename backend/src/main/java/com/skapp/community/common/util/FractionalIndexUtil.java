package com.skapp.community.common.util;

import lombok.experimental.UtilityClass;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@UtilityClass
public class FractionalIndexUtil {

	public static final String BASE_62_DIGITS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

	private static String midpoint(String a, String b, String digits) {
		char zero = digits.charAt(0);

		if (b != null && a.compareTo(b) >= 0) {
			throw new IllegalArgumentException(a + " >= " + b);
		}

		if (!a.isEmpty() && a.charAt(a.length() - 1) == zero
				|| (b != null && !b.isEmpty() && b.charAt(b.length() - 1) == zero)) {
			throw new IllegalArgumentException("trailing zero");
		}

		if (b != null) {
			int n = 0;
			while (n < Math.max(a.length(), b.length())) {
				char charA = n < a.length() ? a.charAt(n) : zero;
				char charB = n < b.length() ? b.charAt(n) : zero;
				if (charA != charB) break;
				n++;
			}
			if (n > 0) {
				return b.substring(0, n) + midpoint(a.substring(n), b.substring(n), digits);
			}
		}

		int digitA = !a.isEmpty() ? digits.indexOf(a.charAt(0)) : 0;
		int digitB = b != null ? digits.indexOf(b.charAt(0)) : digits.length();

		if (digitB - digitA > 1) {
			int midDigit = Math.round(0.5f * (digitA + digitB));
			return String.valueOf(digits.charAt(midDigit));
		}
		else {
			if (b != null && b.length() > 1) {
				return b.substring(0, 1);
			}
			else {
				return digits.charAt(digitA) + midpoint(a.substring(1), null, digits);
			}
		}
	}

	private static void validateInteger(String intPart) {
		if (intPart.length() != getIntegerLength(intPart.charAt(0))) {
			throw new IllegalArgumentException("invalid integer part of order key: " + intPart);
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
		String repeated = String.valueOf(digits.charAt(0)).repeat(26);
		if (key.equals("A" + repeated)) {
			throw new IllegalArgumentException("invalid order key: " + key);
		}

		String i = getIntegerPart(key);
		String f = key.substring(i.length());

		if (!f.isEmpty() && f.charAt(f.length() - 1) == digits.charAt(0)) {
			throw new IllegalArgumentException("invalid order key: " + key);
		}
	}

	private static String incrementInteger(String x, String digits) {
		validateInteger(x);

		char head = x.charAt(0);
		char[] digs = x.substring(1).toCharArray();
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
			StringBuilder result = new StringBuilder().append(h);
			if (h > 'a') {
				result.append(new String(digs)).append(digits.charAt(0));
			}
			else {
				if (digs.length > 0) {
					result.append(new String(digs, 0, digs.length - 1));
				}
			}
			return result.toString();
		}
		else {
			return head + new String(digs);
		}
	}

	private static String decrementInteger(String x, String digits) {
		validateInteger(x);

		char head = x.charAt(0);
		char[] digs = x.substring(1).toCharArray();
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
			StringBuilder result = new StringBuilder().append(h);
			if (h < 'Z') {
				result.append(new String(digs)).append(digits.charAt(digits.length() - 1));
			}
			else {
				if (digs.length > 0) {
					result.append(new String(digs, 0, digs.length - 1));
				}
			}
			return result.toString();
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
			String repeated = String.valueOf(digits.charAt(0)).repeat(26);

			if (ib.equals("A" + repeated)) {
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

	public static List<String> generateNKeysBetween(String a, String b, int n) {
		return generateNKeysBetween(a, b, n, BASE_62_DIGITS);
	}

	public static List<String> generateNKeysBetween(String a, String b, int n, String digits) {
		if (n == 0) {
			return new ArrayList<>();
		}
		if (n == 1) {
			List<String> result = new ArrayList<>();
			result.add(generateKeyBetween(a, b, digits));
			return result;
		}

		if (b == null) {
			String c = generateKeyBetween(a, null, digits);
			List<String> result = new ArrayList<>();
			result.add(c);
			for (int i = 0; i < n - 1; i++) {
				c = generateKeyBetween(c, null, digits);
				result.add(c);
			}
			return result;
		}

		if (a == null) {
			String c = generateKeyBetween(null, b, digits);
			List<String> result = new ArrayList<>();
			result.add(c);
			for (int i = 0; i < n - 1; i++) {
				c = generateKeyBetween(null, c, digits);
				result.add(c);
			}
			Collections.reverse(result);
			return result;
		}

		int mid = (int) Math.floor(n / 2.0);
		String c = generateKeyBetween(a, b, digits);
		List<String> result = new ArrayList<>(generateNKeysBetween(a, c, mid, digits));
		result.add(c);
		result.addAll(generateNKeysBetween(c, b, n - mid - 1, digits));
		return result;
	}

}
