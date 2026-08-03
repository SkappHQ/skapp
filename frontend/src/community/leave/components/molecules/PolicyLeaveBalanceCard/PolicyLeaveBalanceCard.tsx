import { Stack, Typography } from "@mui/material";
import { useState } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import Tooltip from "~community/common/components/atoms/Tooltip/Tooltip";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { formatDateWithOrdinalSuffix } from "~community/common/utils/dateTimeUtils";
import { EmployeePolicyBalanceType } from "~community/leave/types/PolicyLeaveTypes";

interface Props {
  policyBalance: EmployeePolicyBalanceType;
}

/**
 * Hover detail inside the apply modal. Scoped to the single policy in play — never a
 * leave-type-wide total.
 */
const PolicyLeaveBalanceCard = ({ policyBalance }: Props) => {
  const translateText = useTranslator(
    "leaveModule",
    "myRequests",
    "policyBalanceCard"
  );

  const [isTooltipOpen, setIsTooltipOpen] = useState<boolean>(false);

  const rowStyles = {
    flexDirection: "row" as const,
    gap: "1rem",
    justifyContent: "space-between"
  };

  return (
    <Tooltip
      ariaLabel={translateText(["ariaLabel"], {
        policyName: policyBalance.policyName
      })}
      open={isTooltipOpen}
      id="policy-leave-balance-tooltip"
      dataTestId="policy-leave-balance-tooltip"
      spanStyles={{ width: "1.25rem", height: "1.25rem", borderRadius: "50%" }}
      title={
        <Stack sx={{ gap: "0.25rem", minWidth: "16rem" }}>
          <Stack sx={rowStyles}>
            <Typography variant="body2">
              {translateText(["available"])}
            </Typography>
            <Typography variant="body2">
              {policyBalance.balanceInDays} / {policyBalance.totalDaysAllocated}
            </Typography>
          </Stack>
          <Stack sx={rowStyles}>
            <Typography variant="body2">
              {translateText(["effectiveFrom"])}
            </Typography>
            <Typography variant="body2">
              {formatDateWithOrdinalSuffix(policyBalance.validFrom)}
            </Typography>
          </Stack>
          <Stack sx={rowStyles}>
            <Typography variant="body2">
              {translateText(["expiryDate"])}
            </Typography>
            <Typography variant="body2">
              {formatDateWithOrdinalSuffix(policyBalance.validTo)}
            </Typography>
          </Stack>
        </Stack>
      }
      tabIndex={-1}
    >
      <Typography
        component="span"
        role="button"
        tabIndex={0}
        aria-label={translateText(["ariaLabel"], {
          policyName: policyBalance.policyName
        })}
        onMouseEnter={() => setIsTooltipOpen(true)}
        onMouseLeave={() => setIsTooltipOpen(false)}
        onFocus={() => setIsTooltipOpen(true)}
        onBlur={() => setIsTooltipOpen(false)}
      >
        <Icon name={IconName.INFORMATION_ICON} />
      </Typography>
    </Tooltip>
  );
};

export default PolicyLeaveBalanceCard;
