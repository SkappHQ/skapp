import { useState } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import Tooltip from "~community/common/components/atoms/Tooltip/Tooltip";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { formatDateWithOrdinalSuffix } from "~community/common/utils/dateTimeUtils";
import { EmployeePolicyBalanceType } from "~community/leave/types/PolicyLeaveTypes";
import { getPolicyBalanceLabel } from "~community/leave/utils/policyLeave/policyLeaveUtils";

interface Props {
  policyBalance: EmployeePolicyBalanceType;
}

const ROW_CLASSES = "flex flex-row justify-between gap-4";

const PolicyLeaveBalanceCard = ({ policyBalance }: Props) => {
  const translateText = useTranslator("leaveModule", "myRequests");

  const [isTooltipOpen, setIsTooltipOpen] = useState<boolean>(false);

  const balanceLabel = getPolicyBalanceLabel({
    balanceInDays: policyBalance.balanceInDays,
    isUnlimited: policyBalance.isUnlimited,
    isBalanceAvailable: policyBalance.isBalanceAvailable,
    translateText: (key) => translateText(["leavePolicyAllocation", ...key])
  });

  const handleShowTooltip = (): void => setIsTooltipOpen(true);

  const handleHideTooltip = (): void => setIsTooltipOpen(false);

  const ariaLabel = translateText(["policyBalanceCard", "ariaLabel"], {
    policyName: policyBalance.policyName
  });

  return (
    <Tooltip
      ariaLabel={ariaLabel}
      open={isTooltipOpen}
      id="policy-leave-balance-tooltip"
      dataTestId="policy-leave-balance-tooltip"
      spanStyles={{ width: "1.25rem", height: "1.25rem", borderRadius: "50%" }}
      title={
        <div className="flex min-w-[16rem] flex-col gap-1">
          <div className={ROW_CLASSES}>
            <p className="body2">
              {translateText(["policyBalanceCard", "available"])}
            </p>
            <p className="body2">
              {policyBalance.isUnlimited || !policyBalance.isBalanceAvailable
                ? balanceLabel
                : `${balanceLabel} / ${policyBalance.totalDaysAllocated}`}
            </p>
          </div>
          <div className={ROW_CLASSES}>
            <p className="body2">
              {translateText(["policyBalanceCard", "effectiveFrom"])}
            </p>
            <p className="body2">
              {formatDateWithOrdinalSuffix(policyBalance.validFrom)}
            </p>
          </div>
          <div className={ROW_CLASSES}>
            <p className="body2">
              {translateText(["policyBalanceCard", "expiryDate"])}
            </p>
            <p className="body2">
              {formatDateWithOrdinalSuffix(policyBalance.validTo)}
            </p>
          </div>
        </div>
      }
      tabIndex={-1}
    >
      <button
        type="button"
        className="inline-flex cursor-pointer items-center justify-center"
        aria-label={ariaLabel}
        onMouseEnter={handleShowTooltip}
        onMouseLeave={handleHideTooltip}
        onFocus={handleShowTooltip}
        onBlur={handleHideTooltip}
      >
        <Icon name={IconName.INFORMATION_ICON} />
      </button>
    </Tooltip>
  );
};

export default PolicyLeaveBalanceCard;
