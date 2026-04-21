import { Theme, useTheme } from "@mui/material";
import { FC } from "react";

interface Props {
  label: string;
  text: string | undefined;
  id?: string;
  isDisabled?: boolean;
  setInputText?: (value: string) => void;
  error?: boolean;
  errorMessage?: string;
  isForAForm?: boolean;
  setInputTextAndKey?: (label: string, value: string) => void;
  ariaLabel?: string;
  isReadOnly?: boolean;
  tabIndex?: number;
  /**
   * If true, displays a red asterisk next to the label to indicate that the field is required.
   * This prop only affects the visual presentation and does not enforce validation.
   */
  required?: boolean;
}

const LeaveStatusPopupColumn: FC<Props> = ({
  label,
  text,
  id,
  isDisabled,
  setInputText,
  error,
  errorMessage,
  isForAForm = false,
  setInputTextAndKey,
  ariaLabel,
  isReadOnly = false,
  tabIndex,
  required
}) => {
  const theme: Theme = useTheme();
  return (
    <div className="flex flex-col" tabIndex={tabIndex}>
      <label
        htmlFor={id}
        className="mb-3"
        style={{ color: error ? theme.palette.error.contrastText : "black" }}
      >
        {label}
        {required && (
          <span style={{ color: theme.palette.error.contrastText }}>*</span>
        )}
      </label>
      <textarea
        id={id}
        readOnly={isReadOnly}
        style={{
          maxWidth: "100%",
          width: "100%",
          minWidth: "100%",
          maxHeight: "5rem",
          height: "5rem",
          minHeight: "5rem",
          background: error
            ? theme.palette.error.light
            : theme.palette.grey[100],
          borderRadius: "8px",
          border: error
            ? `${theme.palette.error.contrastText} 1px solid`
            : "none",
          outline: "none",
          padding: 12,
          fontStyle: "normal",
          fontWeight: "400",
          fontSize: " 16px",
          resize: "none"
        }}
        value={text}
        onChange={
          isForAForm
            ? (e) => setInputTextAndKey?.(label, e.target.value)
            : (e) => setInputText?.(e.target.value)
        }
        disabled={isDisabled ?? false}
        aria-label={ariaLabel}
        aria-invalid={!!error}
        aria-readonly={isReadOnly}
      />
      {error && (
        <p
          id={`${id ?? ""}-error`}
          style={{ color: theme.palette.error.contrastText }}
          aria-atomic={true}
          aria-live="polite"
        >
          {errorMessage}
        </p>
      )}
    </div>
  );
};

export default LeaveStatusPopupColumn;
