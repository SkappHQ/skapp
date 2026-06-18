import * as Yup from "yup";

import { characterLengths } from "../constants/stringConstants";
import { isValidEmail } from "../regex/regexPatterns";
import { TranslatorFunctionType } from "../types/CommonTypes";

export const emailValidation = (translateText: TranslatorFunctionType) => {
  return Yup.string()
    .trim()
    .matches(isValidEmail(), translateText(["emailValidError"]))
    .required(translateText(["emailRequiredError"]))
    .max(
      characterLengths.CHARACTER_LENGTH,
      translateText(["emailLengthError"])
    );
};

export const passwordValidation = (translateText: TranslatorFunctionType) => {
  return Yup.string()
    .min(8, translateText(["passwordMinLengthError"]))
    .matches(/[a-z]/, translateText(["passwordLowercaseError"]))
    .matches(/[A-Z]/, translateText(["passwordUppercaseError"]))
    .matches(/[0-9]/, translateText(["passwordNumberError"]))
    .matches(
      /[!@#$%^&*(),.?":{}|<>~'`\-_=+\\[\];]/,
      translateText(["passwordSpecialCharError"])
    )
    .required(translateText(["passwordRequiredError"]));
};

export const confirmPasswordValidation = (
  translateText: TranslatorFunctionType,
  password: string
) => {
  return Yup.string()
    .oneOf([Yup.ref(password)], translateText(["passwordMatchError"]))
    .required(translateText(["confirmPasswordRequiredError"]));
};

export const buildWorkLocationValidationSchema = (
  translateText: (keys: string[]) => string
) =>
  Yup.object({
    name: Yup.string()
      .required(translateText(["validation.nameRequired"]))
      .max(50, translateText(["validation.nameMaxLength"]))
  });
