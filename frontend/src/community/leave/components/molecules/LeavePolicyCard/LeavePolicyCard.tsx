import { Box, Stack, Tooltip, Typography } from "@mui/material";
import { type Theme, useTheme } from "@mui/material/styles";
import { ArrowRightIcon, ButtonV2 } from "@rootcodelabs/skapp-ui";
import { forwardRef, useState } from "react";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { getEmoji, mergeSx } from "~community/common/utils/commonUtil";
import { shouldActivateButton } from "~community/common/utils/keyboardUtils";
import { usePolicyLeaveStore } from "~community/leave/store/policyLeaveStore";
import { EmployeePolicyBalanceType } from "~community/leave/types/PolicyLeaveTypes";
import { getDisabledReasonToastKeys } from "~community/leave/utils/policyLeave/policyLeaveUtils";

import styles from "./styles";

interface Props {
  policyBalance: EmployeePolicyBalanceType;
}

const LeavePolicyCard = forwardRef<HTMLDivElement, Props>(
  ({ policyBalance }, ref) => {
    const {
      policyName,
      totalDaysAllocated,
      balanceInDays,
      isBalanceAvailable,
      isUnlimited,
      isDisabled,
      disabledReason,
      leaveType
    } = policyBalance;

    const theme: Theme = useTheme();
    const classes = styles(theme);

    const translateText = useTranslator(
      "leaveModule",
      "myRequests",
      "leavePolicyAllocation"
    );

    const { setToastMessage } = useToast();
    const { openApplyModalForPolicy } = usePolicyLeaveStore();

    const [isMouseOn, setMouseOn] = useState(false);

    const isActionable = !isDisabled && isBalanceAvailable;

    const handleClick = (): void => {
      if (isActionable) {
        openApplyModalForPolicy(policyBalance);
        return;
      }

      const { titleKey, descriptionKey } =
        getDisabledReasonToastKeys(disabledReason);

      setToastMessage({
        open: true,
        toastType: ToastType.ERROR,
        title: translateText([titleKey], { policyName }),
        description: translateText([descriptionKey])
      });
    };

    const balanceLabel = !isBalanceAvailable
      ? "—"
      : isUnlimited
        ? translateText(["unlimited"])
        : balanceInDays;

    const card = (
      <Stack
        ref={ref}
        role="button"
        tabIndex={0}
        aria-disabled={isDisabled}
        sx={
          isActionable
            ? classes.activeCard
            : mergeSx([classes.activeCard, classes.disabledCard])
        }
        onMouseEnter={() => setMouseOn(true)}
        onMouseLeave={() => setMouseOn(false)}
        onClick={handleClick}
        onKeyDown={(event) => {
          if (shouldActivateButton(event.key)) {
            event.preventDefault();
            handleClick();
          }
        }}
        aria-label={translateText(["cardAriaLabel"], {
          policyName,
          leaveType: leaveType.name,
          balance: balanceLabel,
          allocated: totalDaysAllocated
        })}
      >
        <Stack sx={classes.leftContent}>
          <Stack>
            <Typography variant="body1" sx={classes.policyName}>
              {policyName} &nbsp;
              {isMouseOn && isActionable && getEmoji(leaveType.emojiCode)}
            </Typography>
            <Typography variant="caption" sx={classes.leaveTypeName}>
              {leaveType.name}
            </Typography>
          </Stack>
          <Stack>
            <Stack sx={classes.amount}>
              <Typography
                sx={isUnlimited ? classes.unlimited : classes.heading}
              >
                {balanceLabel}
              </Typography>
              {!isUnlimited && (
                <Typography variant="body2">/ {totalDaysAllocated}</Typography>
              )}
            </Stack>
            <Typography component="div" variant="caption">
              {translateText(["available"])}
            </Typography>
          </Stack>
        </Stack>
        <Stack sx={classes.rightContent}>
          {(!isMouseOn || !isActionable) && (
            <Box aria-hidden="true">{getEmoji(leaveType.emojiCode)}</Box>
          )}
          {isMouseOn && isActionable && (
            <ButtonV2
              onClick={(event) => {
                event.stopPropagation();
                handleClick();
              }}
              variant={"primary"}
              size={"md"}
              icon={<ArrowRightIcon />}
              iconPosition="end"
            >
              {translateText(["applyBtn"])}
            </ButtonV2>
          )}
        </Stack>
      </Stack>
    );

    if (!isBalanceAvailable) {
      return (
        <Tooltip title={translateText(["balanceUnavailableTooltip"])} arrow>
          <Box component="span" sx={{ display: "block", width: "100%" }}>
            {card}
          </Box>
        </Tooltip>
      );
    }

    if (isActionable && !isUnlimited && balanceInDays <= 5) {
      return (
        <Tooltip
          title={translateText(["daysRemainingTooltip"], {
            days: balanceInDays
          })}
          arrow
        >
          <Box component="span" sx={{ display: "block", width: "100%" }}>
            {card}
          </Box>
        </Tooltip>
      );
    }

    return card;
  }
);

LeavePolicyCard.displayName = "LeavePolicyCard";

export default LeavePolicyCard;
