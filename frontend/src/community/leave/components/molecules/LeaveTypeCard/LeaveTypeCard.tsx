import { Box, Stack, Typography } from "@mui/material";
import { type Theme, useTheme } from "@mui/material/styles";
import { FC, useMemo, useState } from "react";

import Button from "~community/common/components/atoms/Button/Button";
import {
  ButtonSizes,
  ButtonStyle,
  ToastType
} from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { IconName } from "~community/common/types/IconTypes";
import { getEmoji, mergeSx } from "~community/common/utils/commonUtil";
import { shouldActivateButton } from "~community/common/utils/keyboardUtils";
import { MyRequestModalEnums } from "~community/leave/enums/MyRequestEnums";
import { useLeaveStore } from "~community/leave/store/store";
import { LeaveAllocationDataTypes } from "~community/leave/types/MyRequests";

import styles from "./styles";

interface Props {
  entitlement: LeaveAllocationDataTypes;
  managers: boolean;
}

const LeaveTypeCard: FC<Props> = ({ entitlement, managers }: Props) => {
  const {
    validTo,
    totalDaysAllocated,
    balanceInDays,
    leaveType: { name, emojiCode }
  } = entitlement;

  const theme: Theme = useTheme();
  const classes = styles(theme);

  const translateText = useTranslator(
    "leaveModule",
    "myRequests",
    "leaveAllocation"
  );

  const translateAria = useTranslator("leaveAria", "leaveTypeCard");

  const { setToastMessage } = useToast();

  const { setMyLeaveRequestModalType, setSelectedLeaveAllocationData } =
    useLeaveStore((state) => state);

  const [isMouseOn, setMouseOn] = useState(false);

  const validUntil = useMemo(
    () => (validTo ? new Date(validTo).setHours(23, 59, 59) : 0),
    [validTo]
  );

  const isExpired = useMemo(
    () => validUntil > 0 && validUntil < Date.now(),
    [validUntil]
  );

  const handleClick = (): void => {
    const showToast = (
      titleKey: string,
      descriptionKey: string,
      type: ToastType
    ) => {
      setToastMessage({
        open: true,
        title: translateText([titleKey], { leaveType: name }),
        description: translateText([descriptionKey]),
        toastType: type
      });
    };

    if (!balanceInDays) {
      showToast(
        "noLeaveError.title",
        "noLeaveError.description",
        ToastType.ERROR
      );
    } else if (isExpired) {
      showToast(
        "allocationExpiredError.title",
        "allocationExpiredError.description",
        ToastType.ERROR
      );
    } else if (!managers) {
      showToast(
        "noSupervisorError.title",
        "noSupervisorError.description",
        ToastType.ERROR
      );
    } else {
      setSelectedLeaveAllocationData(entitlement);
      setMyLeaveRequestModalType(MyRequestModalEnums.APPLY_LEAVE);
    }
  };

  return (
    <Stack
      role="button"
      tabIndex={0}
      aria-disabled={!managers}
      sx={
        !balanceInDays || !managers || isExpired
          ? mergeSx([classes.activeCard, classes.disabledCard])
          : classes.activeCard
      }
      onMouseEnter={() => setMouseOn(true)}
      onMouseLeave={() => setMouseOn(false)}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (shouldActivateButton(e.key)) {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-label={
        !balanceInDays || isExpired
          ? translateAria(["entitlementOver"], { name })
          : `${name}  ${balanceInDays} / ${totalDaysAllocated} ${translateAria(["available"])}  `
      }
    >
      <Stack sx={classes.leftContent} aria-hidden={isExpired || !balanceInDays}>
        <Typography variant="body1">
          {name} &nbsp;
          {isMouseOn &&
            !!balanceInDays &&
            managers &&
            !isExpired &&
            getEmoji(emojiCode)}
        </Typography>
        <Stack>
          <Stack sx={classes.amount}>
            <Typography sx={classes.heading}>{balanceInDays}</Typography>
            <Typography variant="body2">/ {totalDaysAllocated}</Typography>
          </Stack>
          <Typography component="div" variant="caption">
            {translateText(["available"])}
          </Typography>
        </Stack>
      </Stack>
      <Stack sx={classes.rightContent}>
        {(!isMouseOn || !balanceInDays || !managers || isExpired) && (
          <Box aria-hidden="true">{getEmoji(emojiCode)}</Box>
        )}
        {isMouseOn && !!balanceInDays && managers && !isExpired && (
          <Button
            label={translateText(["applyBtn"])}
            onClick={handleClick}
            disabled={!balanceInDays}
            buttonStyle={ButtonStyle.PRIMARY}
            size={ButtonSizes.MEDIUM}
            endIcon={IconName.RIGHT_ARROW_ICON}
          />
        )}
      </Stack>
    </Stack>
  );
};

export default LeaveTypeCard;
