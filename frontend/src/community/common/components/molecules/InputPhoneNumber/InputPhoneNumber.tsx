import { Stack, type SxProps, Typography } from "@mui/material";
import { type Theme, useTheme } from "@mui/material/styles";
import { type ChangeEvent, FC, KeyboardEvent, useEffect, useRef } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/material.css";

import Tooltip from "~community/common/components/atoms/Tooltip/Tooltip";
import { characterLengths } from "~community/common/constants/stringConstants";
import { ZIndexEnums } from "~community/common/enums/CommonEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { phoneNumberPattern } from "~community/common/regex/regexPatterns";
import {
  shouldActivateButton,
  shouldCloseDialog,
  shouldNavigateForward
} from "~community/common/utils/keyboardUtils";

import InputField from "../InputField/InputField";

interface Props {
  label: string;
  countryCodeValue: string;
  placeHolder?: string;
  value: string;
  onChangeCountry?: (countryCode: string) => Promise<void>;
  onChange?: (phone: ChangeEvent<HTMLInputElement>) => Promise<void>;
  error?: string;
  tooltip?: string;
  inputName: string;
  componentStyle?: SxProps;
  required?: boolean;
  fullComponentStyle?: SxProps;
  inputStyle?: SxProps;
  isDisabled?: boolean;
  readOnly?: boolean;
  labelStyles?: SxProps;
  ariaLabel?: string;
}
const InputPhoneNumber: FC<Props> = ({
  label,
  value,
  onChange,
  placeHolder,
  error,
  tooltip,
  countryCodeValue,
  onChangeCountry,
  inputName,
  componentStyle,
  required,
  fullComponentStyle,
  isDisabled,
  inputStyle,
  readOnly,
  labelStyles,
  ariaLabel
}) => {
  const translateText = useTranslator(
    "commonAria",
    "components",
    "inputPhoneNumber"
  );
  const theme: Theme = useTheme();
  const phoneInputRef = useRef<any>(null);

  const handleCountryKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (shouldActivateButton(e.key)) {
      e.preventDefault();
      if (phoneInputRef.current) {
        phoneInputRef.current.setOpen(true);
      }
    }
    if (shouldCloseDialog(e.key) && phoneInputRef.current?.state.open) {
      e.preventDefault();
      phoneInputRef.current.setOpen(false);
    }
    if (shouldNavigateForward(e.key) && phoneInputRef.current?.state.open) {
      e.preventDefault();
      phoneInputRef.current.setOpen(false);
    }
  };

  useEffect(() => {
    const handleDropdownAccessibility = () => {
      const list = document.querySelector(".country-list");
      const options = document.querySelectorAll(".country-list .country");

      if (list) {
        list.setAttribute("role", "listbox");
      }

      options.forEach((el: any, index) => {
        const countryName = el?.querySelector(".country-name")?.textContent;
        const dialCode = el?.querySelector(".dial-code")?.textContent;
        const id = `country-option-${index}`;

        if (countryName && dialCode) {
          el.setAttribute("role", "option");
          el.setAttribute("id", id);
          el.setAttribute("aria-label", `${countryName} ${dialCode}`);

          const cleanDialCode = dialCode.replace("+", "");
          const isSelected = cleanDialCode === countryCodeValue;
          el.setAttribute("aria-selected", isSelected ? "true" : "false");
        }
      });

      const input = document.querySelector(".flag-dropdown input");
      const selected = document.querySelector(".country.highlight");

      if (input && selected) {
        const selectedIndex = Array.from(options).indexOf(selected);
        const selectedId = `country-option-${selectedIndex}`;
        input.setAttribute("aria-activedescendant", selectedId);
      }
    };

    const interval = setInterval(handleDropdownAccessibility, 300);
    return () => clearInterval(interval);
  }, [countryCodeValue]);

  return (
    // TODO: move styles to styles.ts
    <>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          paddingRight: "0.875rem",
          mt: "0.75rem",
          mb: "0.5rem",
          ...fullComponentStyle
        }}
      >
        <Typography
          variant="placeholder"
          sx={{
            ...(labelStyles || {}),
            color: isDisabled
              ? theme.palette.text.disabled
              : error
                ? theme.palette.error.contrastText
                : "black"
          }}
        >
          {label} {required && <span style={{ color: "red" }}>*</span>}
        </Typography>
        {tooltip && <Tooltip title={tooltip} />}
      </Stack>
      <Stack
        direction="row"
        alignItems="flex-start"
        gap={1}
        role="group"
        aria-label={`${ariaLabel ? ariaLabel : label} ${translateText(["countryCode"])}`}
      >
        <PhoneInput
          value={countryCodeValue}
          onChange={onChangeCountry}
          inputProps={{
            readOnly: true,
            "aria-label": `${ariaLabel ? ariaLabel : label} ${translateText(["countryCode"])}`,
            role: "combobox",
            "aria-expanded": phoneInputRef.current?.state.open
              ? "true"
              : "false",
            "aria-haspopup": "listbox",
            tabIndex: -1
          }}
          disableDropdown={isDisabled}
          inputStyle={{
            backgroundColor: isDisabled
              ? theme.palette.grey[100]
              : error
                ? theme.palette.error.light
                : theme.palette.grey[100],
            width: "4.0625rem",
            color: theme.palette.text.secondary,
            fontSize: "1rem",
            fontWeight: 400,
            fontFamily: "Poppins",
            fontStyle: "normal",
            letterSpacing: "0.0313rem",
            borderTop: error
              ? `${theme.palette.error.contrastText} 0.0625rem solid`
              : "none",
            borderBottom: error
              ? `${theme.palette.error.contrastText} 0.0625rem solid`
              : "none",
            borderRight: error
              ? `${theme.palette.error.contrastText} 0.0625rem solid`
              : "none",
            padding: "0.75rem 0rem 0.75rem 1rem",
            marginLeft: "2.5rem",
            borderRadius: "0.5rem",
            borderTopLeftRadius: "0rem",
            borderBottomLeftRadius: "0rem"
          }}
          specialLabel=""
          countryCodeEditable={false}
          enableSearch
          containerClass={"input-phone-number"}
          buttonStyle={{
            backgroundColor: error
              ? theme.palette.error.light
              : theme.palette.grey[100],
            minWidth: "3.4375rem",
            borderRadius: "0.5rem",
            borderTop: error
              ? `${theme.palette.error.contrastText} 0.0625rem solid`
              : "none",
            borderLeft: error
              ? `${theme.palette.error.contrastText} 0.0625rem solid`
              : "none",
            borderBottom: error
              ? `${theme.palette.error.contrastText} 0.0625rem solid`
              : "none",
            borderTopRightRadius: "0rem",
            borderBottomRightRadius: "0rem",
            cursor: isDisabled ? "not-allowed" : "pointer"
          }}
          dropdownStyle={{
            zIndex: ZIndexEnums.DEFAULT,
            position: "absolute"
          }}
          onKeyDown={handleCountryKeyDown}
        />
        <InputField
          inputName={inputName}
          placeHolder={placeHolder}
          value={value}
          onChange={onChange}
          readOnly={readOnly}
          componentStyle={{ mt: 0, width: "400%", ...componentStyle }}
          inputStyle={{
            mt: 0,
            border: error
              ? `${theme.palette.error.contrastText} 0.0625rem solid`
              : "none",
            bgcolor: error ? theme.palette.error.light : "grey.100",
            ...inputStyle
          }}
          inputType="text"
          error={error}
          maxLength={characterLengths.PHONE_NUMBER_LENGTH_MAX}
          inputMode="numeric"
          onKeyDown={(e) => {
            // TODO: move this to a separate file and write unit test cases
            if (
              !phoneNumberPattern().test(e.key) &&
              !["Backspace", "Tab", "ArrowLeft", "ArrowRight"].includes(
                e.key
              ) &&
              !(e.ctrlKey && ["a", "c", "v", "x"].includes(e.key))
            ) {
              e.preventDefault();
            }
          }}
          onPaste={(e) => {
            // TODO: move this to a separate file and write unit test cases
            if (!phoneNumberPattern().test(e.clipboardData.getData("Text"))) {
              e.preventDefault();
            }
          }}
          ariaLabel={ariaLabel}
          isDisabled={isDisabled}
        />
      </Stack>
    </>
  );
};

export default InputPhoneNumber;
