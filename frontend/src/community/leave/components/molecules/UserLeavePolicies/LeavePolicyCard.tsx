import { Card, KebabMenu } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { formatDays, getEmoji } from "~community/common/utils/commonUtil";
import {
  EmployeeLeavePolicyType,
  PolicyType
} from "~community/leave/types/LeavePolicyTypes";

export interface LeaveUsage {
  remaining: number;
  total: number;
}

interface Props {
  policy: EmployeeLeavePolicyType;
  usage?: LeaveUsage;
  canManagePolicies: boolean;
  isKebabMenuOpen: boolean;
  onKebabToggle: (isOpen: boolean) => void;
  onUnassign: () => void;
}

const LeavePolicyCard: FC<Props> = ({
  policy,
  usage,
  canManagePolicies,
  isKebabMenuOpen,
  onKebabToggle,
  onUnassign
}) => {
  const translateText = useTranslator("leaveModule", "leavePolicyAssignment");

  const isFlexiblePolicy = policy.policyType === PolicyType.FLEXIBLE;

  return (
    <Card className="flex h-full flex-row items-center justify-between gap-4 bg-white p-6!">
      <div className="flex min-w-0 flex-row items-center gap-6">
        {isFlexiblePolicy ? (
          <span
            className="body2 shrink-0 text-secondary-text"
            aria-label={translateText(["balanceNotTrackedLabel"])}
          >
            {translateText(["balanceNotTracked"])}
          </span>
        ) : (
          usage && (
            <div
              className="flex shrink-0 items-baseline gap-0.5"
              aria-label={translateText(["leavesRemainingLabel"], {
                remaining: usage.remaining,
                total: usage.total
              })}
            >
              <span className="text-2xl text-black">
                {formatDays(usage.remaining)}
              </span>
              <span className="body2 text-secondary-text">
                /{formatDays(usage.total)}
              </span>
            </div>
          )
        )}
        <div className="flex min-w-0 flex-col">
          <span className="body1 inline-flex items-center gap-2 truncate text-black">
            {policy.leaveTypeEmojiCode && (
              <span role="img" aria-hidden="true">
                {getEmoji(policy.leaveTypeEmojiCode)}
              </span>
            )}
            {policy.leaveTypeName}
          </span>
          <span className="body2 truncate text-secondary-text">
            {isFlexiblePolicy
              ? `${policy.policyName} · ${translateText(["entitlementTypeFlexible"])}`
              : policy.policyName}
          </span>
        </div>
      </div>
      {canManagePolicies && (
        <KebabMenu
          id={`employee-leave-policy-kebab-menu-${policy.id}`}
          isOpen={isKebabMenuOpen}
          onToggle={onKebabToggle}
          menuItems={[
            {
              id: `employee-leave-policy-unassign-${policy.id}`,
              label: translateText(["menuUnassign"]),
              onClick: onUnassign
            }
          ]}
        />
      )}
    </Card>
  );
};

export default LeavePolicyCard;
