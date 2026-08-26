import { Stack, type SxProps, Typography } from "@mui/material";
import { type Theme, useTheme } from "@mui/material/styles";
import {
  type ChangeEvent,
  FC,
  KeyboardEvent,
  useEffect,
  useId,
  useRef
} from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/material.css";

import Tooltip from "~community/common/components/atoms/Tooltip/Tooltip";
import { ZIndexEnums } from "~community/common/enums/CommonEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { phoneNumberPattern } from "~community/common/regex/regexPatterns";
import { getPhoneNumberMaxLength } from "~community/common/utils/commonUtil";
import {
  shouldActivateButton,
  shouldCloseDialog,
  shouldNavigateForward
} from "~community/common/utils/keyboardUtils";

import InputField from "../InputField/InputField";

interface PhoneInputInstance {
  state: { open: boolean };
  setOpen: (open: boolean) => void;
}

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
  const phoneInputRef = useRef<PhoneInputInstance | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  const countryListLabel = translateText(["countryList"]);
  const countrySearchLabel = translateText(["countrySearch"]);
  const countryCodeLabel = `${ariaLabel ? ariaLabel : label} ${translateText(["countryCode"])}`;

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
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const handleDropdownAccessibility = () => {
      const list = container.querySelector(".country-list");
      const options = container.querySelectorAll<HTMLElement>(
        ".country-list .country"
      );
      const searchItem = container.querySelector(".country-list .search");

      if (list) {
        list.setAttribute("role", "listbox");
        list.setAttribute("aria-label", countryListLabel);
        list.setAttribute("id", listboxId);
      }

      // A listbox only permits option/group children. This <li> wraps the
      // library's search input, so it is neither an option nor safe to hide —
      // "group" is the only permitted role that is honest about the element.
      // Do not change this to option, presentation, or aria-hidden.
      if (searchItem) {
        searchItem.setAttribute("role", "group");
      }

      const searchBox = container.querySelector(".country-list .search-box");

      if (searchBox) {
        searchBox.setAttribute("aria-label", countrySearchLabel);
      }

      options.forEach((el: HTMLElement, index: number) => {
        const countryName = el?.querySelector(".country-name")?.textContent;
        const dialCode = el?.querySelector(".dial-code")?.textContent;
        const id = `${listboxId}-option-${index}`;

        if (countryName && dialCode) {
          el.setAttribute("role", "option");
          el.setAttribute("id", id);
          el.setAttribute("aria-label", `${countryName} ${dialCode}`);

          const cleanDialCode = dialCode.replace("+", "");
          const isSelected = cleanDialCode === countryCodeValue;
          el.setAttribute("aria-selected", isSelected ? "true" : "false");
        }
      });

      const input = container.querySelector(".form-control");

      if (input) {
        input.setAttribute("aria-expanded", list ? "true" : "false");

        const selected = list
          ? container.querySelector<HTMLElement>(".country.highlight")
          : null;
        const selectedIndex = selected
          ? Array.from(options).indexOf(selected)
          : -1;

        if (selectedIndex >= 0) {
          input.setAttribute(
            "aria-activedescendant",
            `${listboxId}-option-${selectedIndex}`
          );
        } else {
          input.removeAttribute("aria-activedescendant");
        }
      }
    };

    handleDropdownAccessibility();

    const observer = new MutationObserver(handleDropdownAccessibility);

    observer.observe(container, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class"]
    });

    return () => observer.disconnect();
  }, [countryCodeValue, countryListLabel, countrySearchLabel, listboxId]);

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
      <Stack direction="row" alignItems="flex-start" gap={1} ref={containerRef}>
        <PhoneInput
          value={countryCodeValue}
          onChange={onChangeCountry}
          inputProps={{
            readOnly: true,
            "aria-label": countryCodeLabel,
            role: "combobox",
            "aria-expanded": "false",
            "aria-haspopup": "listbox",
            "aria-controls": listboxId,
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
            fontFamily: theme.typography.fontFamily,
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
          maxLength={getPhoneNumberMaxLength(countryCodeValue)}
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
