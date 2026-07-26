import { ButtonV2, KebabMenu } from "@rootcodelabs/skapp-ui";
import { FC, useState } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { useGetEmployeeLeavePolicies } from "~community/leave/api/LeavePolicyAssignmentApi";
import AssignLeavePolicyModal from "~community/leave/components/molecules/AssignLeavePolicyModal/AssignLeavePolicyModal";
import LeaveTypeChip from "~community/leave/components/molecules/LeaveTypeChip/LeaveTypeChip";
import UnassignLeavePolicyModal from "~community/leave/components/molecules/UnassignLeavePolicyModal/UnassignLeavePolicyModal";
import useCanManageLeavePolicies from "~community/leave/hooks/useCanManageLeavePolicies";
import { EmployeeLeavePolicyType } from "~community/leave/types/LeavePolicyTypes";

interface Props {
  employeeId: number;
}

const UserLeavePolicies: FC<Props> = ({ employeeId }) => {
  const translateText = useTranslator(
    "leaveModule",
    "leavePolicyAssignment"
  );
  const canManagePolicies = useCanManageLeavePolicies();

  const [isAssignModalOpen, setIsAssignModalOpen] = useState<boolean>(false);
  const [openKebabMenuId, setOpenKebabMenuId] = useState<number | null>(null);
  const [unassigningPolicy, setUnassigningPolicy] =
    useState<EmployeeLeavePolicyType | null>(null);

  const { data: employeeLeavePolicies = [], isLoading } =
    useGetEmployeeLeavePolicies(employeeId);

  const hasPolicies = employeeLeavePolicies.length > 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row items-center justify-between gap-3">
        <h3 className="header3 text-black">
          {translateText(["sectionTitle"])}
        </h3>
        {canManagePolicies && (
          <ButtonV2
            variant="secondary"
            size="sm"
            onClick={() => setIsAssignModalOpen(true)}
          >
            {translateText(["assignPolicyBtnTxt"])}
          </ButtonV2>
        )}
      </div>

      {!isLoading && !hasPolicies && (
        <div className="rounded-lg bg-tertiary-background px-4 py-6">
          <p className="body1 text-secondary-text">
            {translateText(["emptyStateTitle"])}
          </p>
        </div>
      )}

      {hasPolicies && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {employeeLeavePolicies.map((policy) => (
            <div
              key={policy.id}
              className="flex flex-row items-start justify-between rounded-lg border border-grey-100 px-4 py-3"
            >
              <div className="flex flex-col gap-1.5">
                <LeaveTypeChip
                  name={policy.leaveTypeName}
                  emojiCode={policy.leaveTypeEmojiCode}
                />
                <span className="body1 text-black">{policy.policyName}</span>
              </div>
              {canManagePolicies && (
                <KebabMenu
                  id={`employee-leave-policy-kebab-menu-${policy.id}`}
                  isOpen={openKebabMenuId === policy.id}
                  onToggle={(isOpen: boolean) =>
                    setOpenKebabMenuId(isOpen ? policy.id : null)
                  }
                  menuItems={[
                    {
                      id: `employee-leave-policy-unassign-${policy.id}`,
                      label: translateText(["menuUnassign"]),
                      onClick: () => setUnassigningPolicy(policy)
                    }
                  ]}
                />
              )}
            </div>
          ))}
        </div>
      )}

      <AssignLeavePolicyModal
        employeeId={employeeId}
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
      />
      <UnassignLeavePolicyModal
        employeeLeavePolicy={unassigningPolicy}
        isOpen={!!unassigningPolicy}
        onClose={() => setUnassigningPolicy(null)}
      />
    </div>
  );
};

export default UserLeavePolicies;
