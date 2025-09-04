import * as Yup from "yup";

import { characterLengths } from "~community/common/constants/stringConstants";
import {
  allowsLettersAndSpecialCharactersForNames,
  allowsLettersAndSpecialCharactersForNamesWithForwardSlash,
  alphaNumericNamePatternWithSpecialCharacters,
  datePatternReverse,
  emailPattern,
  isValidEmail,
  onlyLettersAndSpaces
} from "~community/common/regex/regexPatterns";
import { EMAIL_MAX_LENGTH } from "~community/people/constants/stringConstants";

import {
  confirmPasswordValidation,
  emailValidation,
  passwordValidation
} from "./validationUtils";

type TranslatorFunctionType = (
  suffixes: string[],
  interpolationValues?: Record<string, string>
) => string;

export const signUpValidation = (translateText: TranslatorFunctionType) =>
  Yup.object({
    firstName: Yup.string()
      .required(translateText(["firstNameRequiredError"]))
      .matches(
        onlyLettersAndSpaces(),
        translateText(["firstNameCharacterError"])
      )
      .max(
        characterLengths.CHARACTER_LENGTH,
        translateText(["firstNameLengthError"])
      ),
    lastName: Yup.string()
      .required(translateText(["lastNameRequiredError"]))
      .matches(
        onlyLettersAndSpaces(),
        translateText(["lastNameCharacterError"])
      )
      .max(
        characterLengths.CHARACTER_LENGTH,
        translateText(["lastNameLengthError"])
      ),
    email: Yup.string()
      .trim()
      .matches(isValidEmail(), translateText(["emailValidError"]))
      .required(translateText(["emailRequiredError"]))
      .max(
        characterLengths.CHARACTER_LENGTH,
        translateText(["emailLengthError"])
      ),
    password: Yup.string()
      .required(translateText(["passwordRequiredError"]))
      .max(
        characterLengths.CHARACTER_LENGTH,
        translateText(["passwordLengthError"])
      )
  });

export const signInValidation = (translateText: TranslatorFunctionType) =>
  Yup.object({
    email: Yup.string()
      .trim()
      .matches(isValidEmail(), translateText(["emailValidError"]))
      .required(translateText(["emailRequiredError"]))
      .max(
        characterLengths.CHARACTER_LENGTH,
        translateText(["emailLengthError"])
      ),
    password: Yup.string()
      .required(translateText(["passwordRequiredError"]))
      .max(
        characterLengths.CHARACTER_LENGTH,
        translateText(["passwordLengthError"])
      )
  });

export const RequestPasswordChangeValidationSchema = (
  translateText: (keys: string[]) => string,
  checkEmailExists: (email: string) => Promise<boolean>
) => {
  return Yup.object().shape({
    email: Yup.string()
      .email(translateText(["emailValidError"]))
      .required(translateText(["emailResetRequiredError"]))
      .test(
        "checkEmailExists",
        translateText(["emailNotExistError"]),
        async (value) => {
          if (!value) return false;
          try {
            const exists = await checkEmailExists(value);
            if (!exists) {
              throw new Yup.ValidationError(
                translateText(["emailNotExistError"]),
                null,
                "email"
              );
            }
            return exists;
          } catch {
            return false;
          }
        }
      )
  });
};

export const organizationSetupValidation = (
  translateText: TranslatorFunctionType
) =>
  Yup.object({
    organizationName: Yup.string()
      .required(translateText(["orgNameRequiredError"]))
      .max(
        characterLengths.ORGANIZATION_NAME_LENGTH,
        translateText(["orgNameLengthError"])
      ),
    country: Yup.string().required(translateText(["countryRequiredError"])),
    organizationTimeZone: Yup.string().required(
      translateText(["timezoneRequiredError"])
    )
  });

export const isEmailInputValid = (email: string): boolean => {
  return isValidEmail().test(String(email).toLowerCase());
};

export const isValidNamePattern = (value: string): boolean => {
  return allowsLettersAndSpecialCharactersForNames().test(value);
};

export const isValidNamePatternWithForwardSlash = (value: string): boolean => {
  return allowsLettersAndSpecialCharactersForNamesWithForwardSlash().test(
    value
  );
};

export const isValidAlphaNumericNamePattern = (value: string): boolean => {
  return alphaNumericNamePatternWithSpecialCharacters().test(value);
};

export const isValidEmailPattern = (value: string): boolean => {
  // First check the basic pattern
  if (!emailPattern().test(value)) {
    return false;
  }
  // Additional validation for consecutive periods and period placement
  const localPart = value.split("@")[0];
  if (
    localPart.includes("..") ||
    localPart.startsWith(".") ||
    localPart.endsWith(".")
  ) {
    return false;
  }

  // Domain validation
  const domainPart = value.split("@")[1];
  if (
    !domainPart.includes(".") ||
    domainPart.startsWith(".") ||
    domainPart.endsWith(".")
  ) {
    return false;
  }

  // Ensure length constraint
  if (value.length > EMAIL_MAX_LENGTH) {
    return false;
  }

  return true;
};

export const passwordValidationSchema = (
  translateText: TranslatorFunctionType
) =>
  Yup.object({
    password: Yup.string()
      .min(8, translateText(["passwordMinLengthError"]))
      .matches(/[a-z]/, translateText(["passwordLowercaseError"]))
      .matches(/[A-Z]/, translateText(["passwordUppercaseError"]))
      .matches(/[0-9]/, translateText(["passwordNumberError"]))
      .matches(
        /[!@#$%^&*(),.?":{}|<>~'`\-_=+\\[\];]/,
        translateText(["passwordSpecialCharError"])
      )
      .required(translateText(["passwordRequiredError"])),
    confirmPassword: Yup.string()
      .oneOf(
        [Yup.ref("password"), undefined],
        translateText(["passwordMatchError"])
      )
      .required(translateText(["confirmPasswordRequiredError"]))
  });

export const dateValidation = (date: string): boolean => {
  return datePatternReverse().test(date);
};

export const updateOrganizationSettingsValidation = (
  translator: TranslatorFunctionType
) =>
  Yup.object({
    companyName: Yup.string().required(translator(["requireCompanyNameError"])),
    companyWebsite: Yup.string().matches(
      /^(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z0-9]{2,}$/,
      translator(["requireCountryError"])
    ),
    country: Yup.string().required(translator(["requireCountryError"]))
  });

export const emailServerSetupValidation = (
  translateText: TranslatorFunctionType
) =>
  Yup.object().shape({
    emailServiceProvider: Yup.string().required(
      translateText(["emailServiceProviderRequired"])
    ),
    username: Yup.string()
      .trim()
      .matches(isValidEmail(), translateText(["emailValidError"]))
      .required(translateText(["usernameRequired"]))
      .max(
        characterLengths.CHARACTER_LENGTH,
        translateText(["emailLengthError"])
      ),
    appPassword: Yup.string().when("isEnabled", {
      is: true,
      then: () => Yup.string().required(translateText(["appPasswordRequired"]))
    })
  });

export const testEmailValidation = (translateText: TranslatorFunctionType) =>
  Yup.object().shape({
    email: emailValidation(translateText)
  });

export const changePasswordValidation = (
  translateText: TranslatorFunctionType
) =>
  Yup.object().shape({
    currentPassword: Yup.string().required(
      translateText(["oldPasswordRequiredError"])
    ),
    password: passwordValidation(translateText),
    confirmPassword: confirmPasswordValidation(translateText, "password")
  });
