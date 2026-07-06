export function isDealNameValid(): RegExp {
  return /^[\p{L}\p{N} \-.,&'()/:@#|]+$/u;
}

export function isContactNameValid(): RegExp {
  return /^[\p{L} \-.,]+$/u;
}
