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

const ROW_CLASSES = "flex flex-row justify-between gap-4";

const PolicyLeaveBalanceCard = ({ policyBalance }: Props) => {
  const translateText = useTranslator(
    "leaveModule",
    "myRequests",
    "policyBalanceCard"
  );

  const [isTooltipOpen, setIsTooltipOpen] = useState<boolean>(false);

  const handleShowTooltip = (): void => setIsTooltipOpen(true);

  const handleHideTooltip = (): void => setIsTooltipOpen(false);

  const ariaLabel = translateText(["ariaLabel"], {
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
            <p className="body2">{translateText(["available"])}</p>
            <p className="body2">
              {policyBalance.balanceInDays} / {policyBalance.totalDaysAllocated}
            </p>
          </div>
          <div className={ROW_CLASSES}>
            <p className="body2">{translateText(["effectiveFrom"])}</p>
            <p className="body2">
              {formatDateWithOrdinalSuffix(policyBalance.validFrom)}
            </p>
          </div>
          <div className={ROW_CLASSES}>
            <p className="body2">{translateText(["expiryDate"])}</p>
            <p className="body2">
              {formatDateWithOrdinalSuffix(policyBalance.validTo)}
            </p>
          </div>
        </div>
      }
      tabIndex={-1}
    >
      <span
        role="button"
        tabIndex={0}
        aria-label={ariaLabel}
        onMouseEnter={handleShowTooltip}
        onMouseLeave={handleHideTooltip}
        onFocus={handleShowTooltip}
        onBlur={handleHideTooltip}
      >
        <Icon name={IconName.INFORMATION_ICON} />
      </span>
    </Tooltip>
  );
};

export default PolicyLeaveBalanceCard;
