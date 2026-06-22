export function isDealNameValid(): RegExp {
  return /^[\p{L}\p{N} \-.,&'()/:@#|]+$/u;
}
