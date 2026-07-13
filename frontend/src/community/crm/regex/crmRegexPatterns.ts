import { characterLengths } from "~community/common/constants/stringConstants";

export function isDealNameValid(): RegExp {
  return /^[\p{L}\p{N} \-.,&'()/:@#|]+$/u;
}

export function isValidCrmPhoneNumber(): RegExp {
  return new RegExp(
    String.raw`^(?=(?:\D*\d){${characterLengths.PHONE_NUMBER_LENGTH_MIN},${characterLengths.PHONE_NUMBER_LENGTH_MAX}}\D*$)[0-9\s\-()+]+$`
  );
}

export function isValidCompanyWebsiteUrl(): RegExp {
  return /^(https:\/\/)?(www\.)?[a-z0-9-]{1,63}(\.[a-z0-9-]{1,63}){0,9}\.[a-z]{2,63}(\/[^\s?#]*)?$/i;
}

export function isContactNameValid(): RegExp {
  return /^[\p{L} \-.,']+$/u;
}
