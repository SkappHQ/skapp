import { Stack, SxProps, Theme, Typography, useTheme } from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { HalfDayType } from "~community/common/enums/CommonEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { DurationSelectorDisabledOptions } from "~community/common/types/MoleculeTypes";
import { mergeSx } from "~community/common/utils/commonUtil";
import { shouldActivateButton } from "~community/common/utils/keyboardUtils";

import styles from "./styles";

interface Props<T> {
  label: string;
  isRequired?: boolean;
  options: {
    fullDay: T;
    halfDayMorning: T;
    halfDayEvening: T;
  };
  disabledOptions: DurationSelectorDisabledOptions;
  value: T;
  onChange: (value: T) => void;
  error?: string | undefined;
  commonButtonStyles?: SxProps;
}

const DurationSelector = <T,>({
  label,
  isRequired = true,
  options,
  disabledOptions = {
    fullDay: false,
    halfDayMorning: false,
    halfDayEvening: false
  },
  value,
  onChange,
  error,
  commonButtonStyles
}: Props<T>) => {
  const translateText = useTranslator("commonComponents", "durationSelector");
  const translateAria = useTranslator("leaveAria", "durationSelector");

  const theme: Theme = useTheme();
  const classes = styles(theme);

  const [isHalfDaySelected, setIsHalfDaySelected] = useState(false);
  const [shouldFocusButton, setShouldFocusButton] = useState<
    HalfDayType.MORNING | HalfDayType.EVENING | null
  >(null);
  const [lastFocusedElement, setLastFocusedElement] =
    useState<HTMLElement | null>(null);
  const morningButtonRef = useRef<HTMLDivElement>(null);
  const eveningButtonRef = useRef<HTMLDivElement>(null);
  const halfDayButtonRef = useRef<HTMLDivElement>(null);
  const fullDayButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value === options.halfDayMorning || value === options.halfDayEvening) {
      setIsHalfDaySelected(true);
    }
  }, [value, options.halfDayEvening, options.halfDayMorning]);

  useEffect(() => {
    if (shouldFocusButton && isHalfDaySelected) {
      if (
        shouldFocusButton === HalfDayType.MORNING &&
        morningButtonRef.current
      ) {
        morningButtonRef.current.focus();
      } else if (
        shouldFocusButton === HalfDayType.EVENING &&
        eveningButtonRef.current
      ) {
        eveningButtonRef.current.focus();
      }
      setShouldFocusButton(null);
    }
  }, [isHalfDaySelected, shouldFocusButton]);

  useEffect(() => {
    if (lastFocusedElement && document.contains(lastFocusedElement)) {
      lastFocusedElement.focus();
      setLastFocusedElement(null);
    }
  }, [value, lastFocusedElement]);

  const muiFullDayClasses = useMemo(() => {
    if (disabledOptions.fullDay) {
      return "Mui-disabled-button";
    } else if (value === options.fullDay) {
      return "Mui-selected-button";
    } else if (error) {
      return "Mui-error-button";
    }
    return "Mui-default-button";
  }, [disabledOptions.fullDay, error, options.fullDay, value]);

  const muiHalfDayClasses = useMemo(() => {
    if (disabledOptions.halfDayMorning && disabledOptions.halfDayEvening) {
      return "Mui-disabled-button";
    } else if (error) {
      return "Mui-error-button";
    }
    return "Mui-default-button";
  }, [disabledOptions.halfDayEvening, disabledOptions.halfDayMorning, error]);

  const muiHalfDayMorningClasses = useMemo(() => {
    if (disabledOptions.halfDayMorning) {
      return "Mui-disabled-button";
    } else if (value === options.halfDayMorning) {
      return "Mui-selected-button";
    } else if (error) {
      return "Mui-error-button";
    }
    return "Mui-default-button";
  }, [disabledOptions.halfDayMorning, error, options.halfDayMorning, value]);

  const muiHalfDayEveningClasses = useMemo(() => {
    if (disabledOptions.halfDayEvening) {
      return "Mui-disabled-button";
    } else if (value === options.halfDayEvening) {
      return "Mui-selected-button";
    } else if (error) {
      return "Mui-error-button";
    }
    return "Mui-default-button";
  }, [disabledOptions.halfDayEvening, error, options.halfDayEvening, value]);

  const onOptionClick = (
    value: T,
    elementRef?: { current: HTMLDivElement | null },
    isDisabled?: boolean
  ) => {
    if (isDisabled) {
      return;
    }
    if (elementRef?.current) {
      setLastFocusedElement(elementRef.current);
    }
    onChange(value);
  };

  const handleHalfDayClick = () => {
    if (disabledOptions.halfDayMorning && disabledOptions.halfDayEvening) {
      return;
    }

    setIsHalfDaySelected(true);

    const halfDayOptionToSelect = disabledOptions.halfDayMorning
      ? options.halfDayEvening
      : options.halfDayMorning;

    onChange(halfDayOptionToSelect);

    setShouldFocusButton(
      disabledOptions.halfDayMorning ? HalfDayType.EVENING : HalfDayType.MORNING
    );
  };

  const getFullDayAriaLabel = () => {
    if (value === options.fullDay) {
      return translateAria(["selectedDurationFullDay"]);
    }
    return translateAria(["selectDurationFullDay"]);
  };

  const getHalfDayAriaLabel = () => {
    if (isHalfDaySelected) {
      return translateAria(["selectMorningOrEveningHalf"]);
    }
    if (value === options.halfDayMorning || value === options.halfDayEvening) {
      return translateAria(["selectedDurationHalfDay"]);
    }
    return translateAria(["selectDurationHalfDay"]);
  };

  const getHalfDayMorningAriaLabel = () => {
    if (value === options.halfDayMorning) {
      return translateAria(["selectedHalfMorning"]);
    }
    return translateAria(["selectHalfMorning"]);
  };

  const getHalfDayEveningAriaLabel = () => {
    if (value === options.halfDayEvening) {
      return translateAria(["selectedHalfEvening"]);
    }
    return translateAria(["selectHalfEvening"]);
  };

  return (
    <Stack
      sx={classes.wrapper}
      role="group"
      aria-label={`${translateAria(["selectDuration"])}, ${isRequired ? translateAria(["mandatoryField"]) : ""}`}
    >
      <Stack sx={classes.container}>
        <Typography
          variant="body1"
          sx={{
            color: error ? theme.palette.error.contrastText : "common.black"
          }}
        >
          {label} &nbsp;
          {isRequired && (
            <Typography component="span" sx={classes.asterisk}>
              *
            </Typography>
          )}
        </Typography>
        <Stack sx={classes.btnWrapper}>
          <Stack
            ref={fullDayButtonRef}
            className={muiFullDayClasses}
            role="button"
            tabIndex={disabledOptions.fullDay ? -1 : 0}
            aria-label={getFullDayAriaLabel()}
            sx={mergeSx([classes.btn, commonButtonStyles])}
            onClick={() =>
              onOptionClick(
                options.fullDay,
                fullDayButtonRef,
                disabledOptions.fullDay
              )
            }
            onKeyDown={(event) => {
              if (shouldActivateButton(event.key)) {
                onOptionClick(
                  options.fullDay,
                  fullDayButtonRef,
                  disabledOptions.fullDay
                );
              }
            }}
          >
            <Typography
              className={muiFullDayClasses}
              sx={classes.btnText}
              variant="body1"
            >
              {translateText(["fullDay"])}
            </Typography>
            {!disabledOptions.fullDay && value === options.fullDay && (
              <Icon name={IconName.SUCCESS_ICON} />
            )}
          </Stack>
          {isHalfDaySelected ? (
            <Stack sx={classes.btnGroup}>
              <Stack
                ref={morningButtonRef}
                className={muiHalfDayMorningClasses}
                role="button"
                tabIndex={disabledOptions.halfDayMorning ? -1 : 0}
                aria-label={getHalfDayMorningAriaLabel()}
                sx={mergeSx([
                  classes.halfBtn,
                  classes.firstHalfBtn,
                  commonButtonStyles
                ])}
                onClick={() =>
                  onOptionClick(
                    options.halfDayMorning,
                    morningButtonRef,
                    disabledOptions.halfDayMorning
                  )
                }
                onKeyDown={(event) => {
                  if (shouldActivateButton(event.key)) {
                    onOptionClick(
                      options.halfDayMorning,
                      morningButtonRef,
                      disabledOptions.halfDayMorning
                    );
                  }
                }}
              >
                <Typography
                  className={muiHalfDayMorningClasses}
                  sx={classes.btnText}
                  variant="body1"
                >
                  {translateText([HalfDayType.MORNING])}
                </Typography>
                {!disabledOptions.halfDayMorning &&
                  value === options.halfDayMorning && (
                    <Icon name={IconName.SUCCESS_ICON} />
                  )}
              </Stack>
              <Stack
                ref={eveningButtonRef}
                className={muiHalfDayEveningClasses}
                role="button"
                tabIndex={disabledOptions.halfDayEvening ? -1 : 0}
                aria-label={getHalfDayEveningAriaLabel()}
                sx={mergeSx([
                  classes.halfBtn,
                  classes.lastHalfBtn,
                  commonButtonStyles
                ])}
                onClick={() =>
                  onOptionClick(
                    options.halfDayEvening,
                    eveningButtonRef,
                    disabledOptions.halfDayEvening
                  )
                }
                onKeyDown={(event) => {
                  if (shouldActivateButton(event.key)) {
                    onOptionClick(
                      options.halfDayEvening,
                      eveningButtonRef,
                      disabledOptions.halfDayEvening
                    );
                  }
                }}
              >
                <Typography
                  className={muiHalfDayEveningClasses}
                  sx={classes.btnText}
                  variant="body1"
                >
                  {translateText([HalfDayType.EVENING])}
                </Typography>
                {!disabledOptions.halfDayEvening &&
                  value === options.halfDayEvening && (
                    <Icon name={IconName.SUCCESS_ICON} />
                  )}
              </Stack>
            </Stack>
          ) : (
            <Stack
              ref={halfDayButtonRef}
              role="button"
              tabIndex={
                disabledOptions.halfDayMorning && disabledOptions.halfDayEvening
                  ? -1
                  : 0
              }
              className={muiHalfDayClasses}
              aria-label={getHalfDayAriaLabel()}
              sx={mergeSx([classes.btn, commonButtonStyles])}
              onClick={handleHalfDayClick}
              onKeyDown={(event) => {
                if (shouldActivateButton(event.key)) {
                  handleHalfDayClick();
                }
              }}
            >
              <Typography
                className={
                  disabledOptions.halfDayMorning &&
                  disabledOptions.halfDayEvening
                    ? "Mui-disabled-button"
                    : "Mui-default-button"
                }
                sx={classes.btnText}
                variant="body1"
              >
                {translateText(["halfDay"])}
              </Typography>
              <Icon
                name={IconName.RIGHT_ARROW_ICON}
                fill={
                  disabledOptions.halfDayMorning &&
                  disabledOptions.halfDayEvening
                    ? theme.palette.grey.A100
                    : theme.palette.text.secondary
                }
              />
            </Stack>
          )}
        </Stack>
      </Stack>
      {!!error && (
        <Typography
          variant="caption"
          role="alert"
          aria-live="assertive"
          sx={{ color: theme.palette.error.contrastText }}
        >
          {error}
        </Typography>
      )}
    </Stack>
  );
};

export default DurationSelector;
