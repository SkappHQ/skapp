export function isValidEmail(): RegExp {
  // eslint-disable-next-line no-useless-escape
  return /^(([^<>()[\]\\.,;:\s@"`~!$%^&*=\}'?#]+(\.[^<>()[\]\\.,;:\s@"`~!$%^&*=\}'?#]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}))$/;
}

export function isValidPhoneNumber(): RegExp {
  return /^[0-9()+-]{10,}$/g;
}

export function numberPattern(): RegExp {
  return /\d/;
}

export function phoneNumberPattern(): RegExp {
  return /[\d\s-]/;
}

export function isValidNameWithAccentsAndApostrophes(): RegExp {
  return /^[a-zA-Z\u00C0-\u00ff']+([ a-zA-Z\u00C0-\u00ff']+)*$/;
}

export function specialCharacters(): RegExp {
  return /[^A-Za-zÀ-ÖØ-öø-ÿĀ-žČčĆćŠšŽžŃń'-\s`´^~çÇ¨˚Øøł¯]/g;
}

export function allowsOnlyLettersAndSpaces(): RegExp {
  return /[^a-zA-Z\s]/g;
}

export function allowsLettersAndSpecialCharactersForNames(): RegExp {
  return /^[A-Za-zÀ-ÖØ-öø-ÿĀ-žČčĆćŠšŽžŃń'-\s`´^~çÇ¨˚Øøł¯]*$/;
}

export function allowsLettersAndSpecialCharactersForNamesWithForwardSlash(): RegExp {
  return /^[A-Za-zÀ-ÖØ-öø-ÿĀ-žČčĆćŠšŽžŃń'-\s`´^~çÇ¨˚Øøł¯/]*$/;
}

export function alphaNumericNamePatternWithSpecialCharacters(): RegExp {
  return /^[A-Za-zÀ-ÖØ-öø-ÿĀ-žČčĆćŠšŽžŃń'-\s`´^~çÇ¨˚Øøł¯0-9/,]*$/;
}
export function alphaNumericWithExtendedSpecialCharacters(): RegExp {
  return /^[A-Za-zÀ-ÖØ-öø-ÿĀ-žČčĆćŠšŽžŃń'-\s`´^~çÇ¨˚Øøł¯0-9/,\\.!@#$%&*()+=?"{}[\]<>]*$/;
}

export const emailPattern = (): RegExp => {
  // Pattern allows:
  // - Before @: a-z, A-Z, 0-9, ., _, %, +, - (no consecutive periods)
  // - After @: Standard domain format with at least one dot
  return /^[a-zA-Z0-9_%+-]+(\.[a-zA-Z0-9_%+-]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+$/;
};

export function isValidAlphaNumericName(): RegExp {
  return /^[a-zA-Z0-9']+([ a-zA-Z0-9']+)*$/;
}

export function hasLowerCaseLetter(): RegExp {
  return /[a-z]/;
}

export function hasUpperCaseLetter(): RegExp {
  return /[A-Z]/;
}

export function hasSpecialCharacter(): RegExp {
  return /[`~!@#$%^&*()-+{}[\]\\|=,.//?;<>':"_-]/;
}

export function specialCharacterPatternWithoutDecimalOrSpace(): RegExp {
  return /[`~!@#$%^&*()-+{}[\]\\|=,//?;<>':"_-]/;
}

export function hasNumber(): RegExp {
  return /\d/;
}

export function isValidDateInDDMMYYYYFormat(): RegExp {
  return /^(0?[1-9]|[12][0-9]|3[01])[-](0?[1-9]|1[012])[-]\d{4}$/;
}

export function isValidDateInYYYYMMDDFormat(): RegExp {
  return /^\d{4}[-](0?[1-9]|1[012])[-](0?[1-9]|[12][0-9]|3[01])$/;
}

export function isValidWebsiteUrl(): RegExp {
  return /^(https?:\/\/)?(www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/[^\s]*)?(\?[^\s]*)?(#[^\s]*)?$/i;
}

export function isValidUrlPattern(): RegExp {
  return /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-zA-Z0-9]+([-.]{1}[a-zA-Z0-9]+)*\.[a-zA-Z]{2,5}(:[0-9]{1,5})?(\/.*)?$/;
}

export function isValidAlphaNumericString(): RegExp {
  return /^[a-zA-Z0-9]+$/;
}

export function hasOnlyAlphaNumericAndSpaces(): RegExp {
  return /^[a-zA-Z0-9\s]*$/;
}

export function hasOnlyAlphaNumericWithSpecialCharacters(): RegExp {
  return /^[a-zA-Z0-9-_!~#.]+$/;
}

export function allowsAlphaNumericWithHyphenAndUnderscore(): RegExp {
  return /^[a-zA-Z0-9-_]+$/;
}

export function matchWhitespace(): RegExp {
  return /\s/g;
}

export function removeNonAlphaNumericCharactersPattern(): RegExp {
  return /[^a-zA-Z0-9 ]/g;
}

export function matchesOnlyLetters(): RegExp {
  return /^[a-zA-Z]+$/;
}

export function matchesTwoOrMoreConsecutiveWhitespaceCharacters(): RegExp {
  return /\s{2,}/g;
}

export function containsUnicode(): RegExp {
  return /\p{Emoji}/u;
}

export function hasAlphaNumericWithSpecialCharacterPattern(): RegExp {
  return /[^a-zA-Z0-9-_!~#.]/gi;
}

export function allowsAlphaNumericWithUnderscoreAndAmpersandButRejectsSlashesAndVerticalBar(): RegExp {
  return /^[a-zA-Z0-9_&-]+$/;
}

export function allowsAlphaNumericWithUnderscoreAndCommaButRejectsSlashesAndVerticalBar(): RegExp {
  return /^[a-zA-Z0-9_,&-]+$/;
}

export function matchesNumberWithAtMostOneDecimalPlace(): RegExp {
  return /^(\d+(\.\d{0,1})?)?$/;
}

export function matchesCommaFollowedByNonWhitespace(): RegExp {
  return /,(\S)/g;
}

export function isValidTimeIn12HourFormat(): RegExp {
  return /^(1[0-2]|0[1-9]):[0-5][0-9]\s(AM|PM)$/;
}

export function allowsOnlyNumbersAndOptionalDecimal(): RegExp {
  return /^\d*(\.5)?$/;
}

export function matchesISO8601Timestamp(): RegExp {
  return /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/;
}

export function matchesYYYYMMDD(): RegExp {
  return /^\s*\d{4}-\d{2}-\d{2}\s*$/;
}

export function onlyLettersAndSpaces(): RegExp {
  return /^[a-zA-Z\s]+$/;
}

export const hasTrailingSpace = (value: string | undefined): boolean => {
  return value ? /\s$/.test(value) : false;
};

export function allowsOnlyLettersSpacesAndCommas(): RegExp {
  return /^[a-zA-Z, ]*$/;
}

export function hasSpecialCharactersAndNumbers(): RegExp {
  return /[0-9`~!@#$%^&*()-+{}[\]\\|=,.//?;<>':"_-]/;
}

export function hasSpecialCharactersAndNumbersExceptComma(): RegExp {
  return /[0-9`~!@#$%^&*()-+{}[\]\\|=.//?;<>':"_-]/;
}

export function numericPatternWithSpaces(): RegExp {
  return /^[a-zA-Z\s]*$/;
}

export function datePatternReverse(): RegExp {
  return /^\d{4}[-](0?[1-9]|1[012])[-](0?[1-9]|[12][0-9]|3[01])$/;
}

export function base64Pattern(): RegExp {
  return /^[A-Za-z0-9+/=]+$/;
}

export function isValidUrlInputPattern(): RegExp {
  return /^[A-Za-z0-9_./:-]*$/;
}

export function removeLetters(input: string): string {
  return input.replace(/[a-zA-Z]/g, "");
}

export function areCommasPresentInString(input: string): boolean {
  const regex = /,/;
  return regex.test(input);
}

export function matchesYYYYMMDDSeparatedByHyphenOrSlashOrPeriod(): RegExp {
  // Matches "YYYY-MM-DD", "YYYY/MM/DD", or "YYYY.MM.DD" with leading zeros
  // Example: "2023-09-15", "2023/09/15", "2023.09.15"
  return /^(\d{4})[-/.](\d{2})[-/.](\d{2})$/;
}

export function matchesMMDDYYYYSeparatedByHyphenOrSlashOrPeriod(): RegExp {
  // Matches "MM-DD-YYYY", "MM/DD/YYYY", or "MM.DD.YYYY"
  // Example: "9-15-2023", "9/15/2023", "9.15.2023"
  return /^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/;
}

export function matchInvalidEmailCharactersSearchPattern(): RegExp {
  return /[^a-zA-Z0-9 @._%+-]/g;
}
