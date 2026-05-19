/**
 * Returns the Tailwind class string for the CheckTask circle
 * based on checked and disabled state.
 */
export const getCircleStyles = (
  checked: boolean,
  disabled: boolean
): string => {
  if (disabled && checked) return "bg-secondary-accent border-secondary-accent";
  if (disabled) return "bg-tertiary-background border-secondary-accent";
  if (checked)
    return "bg-semantic-success border-semantic-success group-hover:bg-semantic-green-text group-hover:border-semantic-green-text";
  return "bg-white border-secondary-accent group-hover:border-secondary-icon";
};

/**
 * Returns the Tailwind class string for the CheckTask checkmark icon
 * based on checked and disabled state.
 */
export const getCheckmarkClasses = (
  checked: boolean,
  disabled: boolean
): string => {
  if (disabled && checked) return "text-white";
  if (disabled) return "text-secondary-accent";
  if (checked) return "text-white";
  return "text-secondary-accent group-hover:text-secondary-icon";
};
