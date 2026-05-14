/**
 * CheckTask — local copy of the skapp-ui CheckTask atom
 * (not yet merged to the skapp-ui develop branch).
 *
 * TODO: Once CheckTask lands in @rootcodelabs/skapp-ui, replace this file
 *       with the package import and delete this atom.
 */
import React from "react";

import {
  getCheckmarkClasses,
  getCircleStyles
} from "~community/crm/utils/checkTaskUtils";

// ─── Internal icon (mirrors skapp-ui CheckTaskIcon) ──────────────────────────

const CheckTaskIcon: React.FC<{ className?: string }> = ({
  className = ""
}) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M16.6667 9.5L10.7083 15.4583L8 12.75"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * `checked` and `disabled` default to false. `size` defaults to "size-6".
 * `onChange` receives the new boolean value after each toggle.
 * `ariaLabel` is optional — supply it when surrounding context does not identify the task.
 * `className` should be used only for margins and positioning.
 */
export interface CheckTaskProps {
  checked?: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  className?: string;
  ariaLabel?: string;
  size?: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

const CheckTask: React.FC<CheckTaskProps> = ({
  checked = false,
  disabled = false,
  onChange,
  onFocus,
  onBlur,
  className = "",
  ariaLabel,
  size = "size-6"
}) => {
  const circleStyles = getCircleStyles(checked, disabled);
  const checkmarkClasses = getCheckmarkClasses(checked, disabled);

  return (
    <label
      className={`group relative inline-flex ${size} ${
        disabled ? "cursor-not-allowed" : "cursor-pointer"
      } ${className}`}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        onFocus={onFocus}
        onBlur={onBlur}
        aria-label={ariaLabel}
        className={[
          size,
          "appearance-none rounded-full border-2",
          "transition-colors duration-150",
          "cursor-pointer disabled:cursor-not-allowed",
          "focus:ring-primary-accent focus:ring-2 focus:ring-offset-2 focus:outline-none",
          circleStyles
        ].join(" ")}
      />

      <CheckTaskIcon
        className={`pointer-events-none absolute inset-0 transition-colors duration-150 ${size} ${checkmarkClasses}`}
      />
    </label>
  );
};

export default CheckTask;
