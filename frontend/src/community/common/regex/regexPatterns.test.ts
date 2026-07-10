import {
  allowsAlphaNumericWithHyphenAndUnderscore,
  allowsAlphaNumericWithUnderscoreAndAmpersandButRejectsSlashesAndVerticalBar,
  allowsAlphaNumericWithUnderscoreAndCommaButRejectsSlashesAndVerticalBar,
  allowsOnlyLettersAndSpaces,
  allowsOnlyNumbersAndOptionalDecimal,
  containsUnicode,
  hasAlphaNumericWithSpecialCharacterPattern,
  hasLowerCaseLetter,
  hasNumber,
  hasOnlyAlphaNumericAndSpaces,
  hasOnlyAlphaNumericWithSpecialCharacters,
  hasSpecialCharacter,
  hasTrailingSpace,
  hasUpperCaseLetter,
  isValidAlphaNumericName,
  isValidAlphaNumericString,
  isValidDateInDDMMYYYYFormat,
  isValidDateInYYYYMMDDFormat,
  isValidEmail,
  isValidNameWithAccentsAndApostrophes,
  isValidPhoneNumber,
  isValidTimeIn12HourFormat,
  isValidUrlPattern,
  isValidWebsiteUrl,
  matchWhitespace,
  matchesCommaFollowedByNonWhitespace,
  matchesISO8601Timestamp,
  matchesNumberWithAtMostOneDecimalPlace,
  matchesOnlyLetters,
  matchesTwoOrMoreConsecutiveWhitespaceCharacters,
  matchesYYYYMMDD,
  onlyLettersAndSpaces,
  removeNonAlphaNumericCharactersPattern,
  specialCharacterPatternWithoutDecimalOrSpace
} from "./regexPatterns";

describe("Validation Functions", () => {
  test("isValidEmail()", () => {
    const regex = isValidEmail();
    expect(regex.test("example@example.com")).toBe(true);
    expect(regex.test("invalid-email")).toBe(false);
    expect(regex.test("user@domain.co.in")).toBe(true);
  });

  test("isValidPhoneNumber()", () => {
    const regex = isValidPhoneNumber();
    expect(regex.test("0123456789")).toBe(true);
    expect(regex.test("012345")).toBe(false);
    expect(regex.test("0123456")).toBe(true);
    expect(regex.test("0123456789012345")).toBe(false);
    expect(regex.test("012345678901234")).toBe(true);
    expect(regex.test("+94712345678")).toBe(false);

  });

  test("isValidNameWithAccentsAndApostrophes()", () => {
    const regex = isValidNameWithAccentsAndApostrophes();
    expect(regex.test("John Doe")).toBe(true);
    expect(regex.test("Marie-Claire")).toBe(false);
    expect(regex.test("John123")).toBe(false);
  });

  test("isValidAlphaNumericName()", () => {
    const regex = isValidAlphaNumericName();
    expect(regex.test("JohnDoe123")).toBe(true);
    expect(regex.test("John_Doe")).toBe(false);
  });

  test("hasLowerCaseLetter()", () => {
    const regex = hasLowerCaseLetter();
    expect(regex.test("abc")).toBe(true);
    expect(regex.test("ABC")).toBe(false);
  });

  test("hasUpperCaseLetter()", () => {
    const regex = hasUpperCaseLetter();
    expect(regex.test("ABC")).toBe(true);
    expect(regex.test("abc")).toBe(false);
  });

  test("hasSpecialCharacter()", () => {
    const regex = hasSpecialCharacter();
    expect(regex.test("abc@")).toBe(true);
    expect(regex.test("abc")).toBe(false);
  });

  test("specialCharacterPatternWithoutDecimalOrSpace()", () => {
    const regex = specialCharacterPatternWithoutDecimalOrSpace();
    expect(regex.test("abc@")).toBe(true);
    expect(regex.test("abc.")).toBe(false);
  });

  test("hasNumber()", () => {
    const regex = hasNumber();
    expect(regex.test("abc123")).toBe(true);
    expect(regex.test("abc")).toBe(false);
  });

  test("isValidDateInDDMMYYYYFormat()", () => {
    const regex = isValidDateInDDMMYYYYFormat();
    expect(regex.test("12-08-2023")).toBe(true);
    expect(regex.test("2023-08-12")).toBe(false);
  });

  test("isValidDateInYYYYMMDDFormat()", () => {
    const regex = isValidDateInYYYYMMDDFormat();
    expect(regex.test("2023-08-12")).toBe(true);
    expect(regex.test("12-08-2023")).toBe(false);
  });

  test("isValidWebsiteUrl()", () => {
    const regex = isValidWebsiteUrl();
    expect(regex.test("https://example.com")).toBe(true);
    expect(regex.test("http://example.com")).toBe(true);
    expect(regex.test("www.example.com")).toBe(true);
    expect(regex.test("example.com")).toBe(true);
    expect(regex.test("https://example.com/path")).toBe(true);
    expect(regex.test("https://example.com?query=123")).toBe(true);
    expect(regex.test("https://example.com#section")).toBe(true);
    expect(regex.test("https://example.com:8080")).toBe(true);
    expect(regex.test("http://sub.example.co.uk")).toBe(true);
    expect(regex.test("example")).toBe(false);
    expect(regex.test("http://")).toBe(false);
    expect(regex.test("https://.com")).toBe(false);
    expect(regex.test("http://example..com")).toBe(false);
    expect(regex.test("ftp://example.com")).toBe(false);
  });

  test("isValidUrlPattern()", () => {
    const regex = isValidUrlPattern();
    expect(regex.test("http://example.com")).toBe(true);
    expect(regex.test("https://example")).toBe(false);
  });

  test("isValidAlphaNumericString()", () => {
    const regex = isValidAlphaNumericString();
    expect(regex.test("abc123")).toBe(true);
    expect(regex.test("abc 123")).toBe(false);
  });

  test("hasOnlyAlphaNumericAndSpaces()", () => {
    const regex = hasOnlyAlphaNumericAndSpaces();
    expect(regex.test("abc 123")).toBe(true);
    expect(regex.test("abc-123")).toBe(false);
  });

  test("hasOnlyAlphaNumericWithSpecialCharacters()", () => {
    const regex = hasOnlyAlphaNumericWithSpecialCharacters();
    expect(regex.test("abc-123_!")).toBe(true);
    expect(regex.test("abc&")).toBe(false);
  });

  test("allowsAlphaNumericWithHyphenAndUnderscore()", () => {
    const regex = allowsAlphaNumericWithHyphenAndUnderscore();
    expect(regex.test("EMP123")).toBe(true);
    expect(regex.test("EMP@123")).toBe(false);
  });

  test("matchWhitespace()", () => {
    const regex = matchWhitespace();
    expect(regex.test("abc def")).toBe(true);
    expect(regex.test("abcdef")).toBe(false);
  });

  test("removeNonAlphaNumericCharactersPattern()", () => {
    const regex = removeNonAlphaNumericCharactersPattern();
    expect("abc-123!@#".replace(regex, "")).toBe("abc123");
  });

  test("matchesOnlyLetters()", () => {
    const regex = matchesOnlyLetters();
    expect(regex.test("abc")).toBe(true);
    expect(regex.test("abc123")).toBe(false);
  });

  test("matchesTwoOrMoreConsecutiveWhitespaceCharacters()", () => {
    const regex = matchesTwoOrMoreConsecutiveWhitespaceCharacters();
    expect(regex.test("abc  def")).toBe(true);
    expect(regex.test("abcdef")).toBe(false);
  });

  test("containsUnicode()", () => {
    const regex = containsUnicode();
    expect(regex.test("Hello 😊")).toBe(true);
    expect(regex.test("Hello")).toBe(false);
  });

  test("hasAlphaNumericWithSpecialCharacterPattern()", () => {
    const regex = hasAlphaNumericWithSpecialCharacterPattern();
    expect(regex.test("abc_123-")).toBe(false);
    expect(regex.test("abc_123!@#")).toBe(true);
  });

  test("allowsAlphaNumericWithUnderscoreAndAmpersandButRejectsSlashesAndVerticalBar()", () => {
    const regex =
      allowsAlphaNumericWithUnderscoreAndAmpersandButRejectsSlashesAndVerticalBar();

    expect(regex.test("abc_123&")).toBe(true);
    expect(regex.test("A_B&C-")).toBe(true);
    expect(regex.test("12345_")).toBe(true);

    expect(regex.test("abc/123")).toBe(false);
    expect(regex.test("abc|123")).toBe(false);
    expect(regex.test("abc_123/")).toBe(false);
  });

  test("allowsAlphaNumericWithUnderscoreAndCommaButRejectsSlashesAndVerticalBar()", () => {
    const regex =
      allowsAlphaNumericWithUnderscoreAndCommaButRejectsSlashesAndVerticalBar();
    expect(regex.test("abc_123,")).toBe(true);
    expect(regex.test("A_B,C-")).toBe(true);
    expect(regex.test("12345_")).toBe(true);
    expect(regex.test("abc/123")).toBe(false);
    expect(regex.test("abc|123")).toBe(false);
    expect(regex.test("abc_123/")).toBe(false);
  });

  test("matchesNumberWithAtMostOneDecimalPlace()", () => {
    const regex = matchesNumberWithAtMostOneDecimalPlace();
    expect(regex.test("123")).toBe(true);
    expect(regex.test("123.4")).toBe(true);
    expect(regex.test("123.45")).toBe(false);
  });

  test("matchesCommaFollowedByNonWhitespace()", () => {
    const regex = matchesCommaFollowedByNonWhitespace();
    expect(regex.test("apple,banana")).toBe(true);
    expect(regex.test("apple, banana")).toBe(false);
  });

  test("isValidTimeIn12HourFormat()", () => {
    const regex = isValidTimeIn12HourFormat();
    expect(regex.test("10:30 AM")).toBe(true);
    expect(regex.test("15:30 PM")).toBe(false);
  });

  test("allowsOnlyNumbersAndOptionalDecimal()", () => {
    const regex = allowsOnlyNumbersAndOptionalDecimal();
    expect(regex.test("123")).toBe(true);
    expect(regex.test("123.5")).toBe(true);
    expect(regex.test("123.45")).toBe(false);
    expect(regex.test("123abc")).toBe(false);
    expect(regex.test(".5")).toBe(true);
    expect(regex.test("0.5")).toBe(true);
    expect(regex.test("")).toBe(true);
  });

  test("matchesISO8601Timestamp()", () => {
    const regex = matchesISO8601Timestamp();
    expect(regex.test("2023-08-12T12:30:45.123Z")).toBe(true);
    expect(regex.test("2023-08-12")).toBe(false);
  });

  test("matchesYYYYMMDD()", () => {
    const regex = matchesYYYYMMDD();
    expect(regex.test("2023-08-12")).toBe(true);
    expect(regex.test("12-08-2023")).toBe(false);
  });

  test("onlyLettersAndSpaces()", () => {
    const regex = onlyLettersAndSpaces();
    expect(regex.test("John Doe")).toBe(true);
    expect(regex.test("John123")).toBe(false);
  });

  test("hasTrailingSpace()", () => {
    expect(hasTrailingSpace("abc ")).toBe(true);
    expect(hasTrailingSpace("abc")).toBe(false);
  });
});

describe("allowsOnlyLettersAndSpaces", () => {
  it("should return a regular expression", () => {
    const regex = allowsOnlyLettersAndSpaces();
    expect(regex).toBeInstanceOf(RegExp);
  });

  it("should match non-letter and non-space characters", () => {
    const regex = allowsOnlyLettersAndSpaces();
    const testString = "Hello123!";
    expect(testString.replace(regex, "")).toBe("Hello");
  });

  it("should allow only letters and spaces", () => {
    const regex = allowsOnlyLettersAndSpaces();
    const testString = "Hello World";
    expect(testString.replace(regex, "")).toBe("Hello World");
  });

  it("should remove special characters", () => {
    const regex = allowsOnlyLettersAndSpaces();
    const testString = "Hello@World!";
    expect(testString.replace(regex, "")).toBe("HelloWorld");
  });

  it("should handle empty strings correctly", () => {
    const regex = allowsOnlyLettersAndSpaces();
    const testString = "";
    expect(testString.replace(regex, "")).toBe("");
  });

  it("should handle strings with only non-allowed characters", () => {
    const regex = allowsOnlyLettersAndSpaces();
    const testString = "123!@#";
    expect(testString.replace(regex, "")).toBe("");
  });
});
