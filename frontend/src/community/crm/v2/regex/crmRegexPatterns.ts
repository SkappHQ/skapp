export function isValidCompanyWebsiteUrl(): RegExp {
  return /^https:\/\/(www\.)?[a-z0-9-]{1,63}(\.[a-z0-9-]{1,63}){0,9}\.[a-z]{2,63}(\/[^\s?#]*)?$/i;
}

export function isContactNameValid(): RegExp {
  return /^[\p{L} \-.,']+$/u;
}
