import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { FC, useMemo } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { useGetLeavePoliciesInfinite } from "~community/leave/api/LeavePolicyApi";
import { ASSIGNABLE_POLICIES_PAGE_SIZE } from "~community/leave/constants/leavePolicyConstants";
import useBulkAssignTemplateHeaders, {
  useBulkAssignResourceHeaders
} from "~community/leave/hooks/useBulkAssignTemplateHeaders";
import {
  LeavePolicyStatus,
  LeavePolicyType,
  PolicyType
} from "~community/leave/types/LeavePolicyTypes";
import { downloadBulkAssignPolicyTemplate } from "~community/leave/utils/bulkAssignPolicyUtils";

interface Props {
  onContinue: () => void;
}

const BulkAssignPolicyInstructionsStep: FC<Props> = ({ onContinue }) => {
  const translateText = useTranslator(
    "leaveModule",
    "leavePolicies",
    "bulkAssignModal"
  );

  const templateHeaders = useBulkAssignTemplateHeaders();
  const resourceHeaders = useBulkAssignResourceHeaders();

  const { data: policyPages, isLoading } = useGetLeavePoliciesInfinite({
    searchKeyword: "",
    leaveTypeId: "",
    size: ASSIGNABLE_POLICIES_PAGE_SIZE
  });

  // The resource tab lists what this upload can actually assign, which is the
  // same set the single-assign modal offers.
  const assignablePolicies: LeavePolicyType[] = useMemo(
    () =>
      (policyPages?.pages?.flatMap((page) => page?.items ?? []) ?? []).filter(
        (policy) =>
          policy.status === LeavePolicyStatus.ACTIVE &&
          policy.policyType === PolicyType.ACCRUAL
      ),
    [policyPages]
  );

  const handleTemplateDownload = (): void => {
    downloadBulkAssignPolicyTemplate({
      sheetNames: {
        template: translateText(["templateSheetName"]),
        resource: translateText(["resourceSheetName"])
      },
      headers: templateHeaders,
      exampleRow: {
        employeeEmail: translateText(["templateExampleEmployeeEmail"]),
        policyId: String(
          assignablePolicies[0]?.id ??
            translateText(["templateExamplePolicyId"])
        ),
        effectiveDate: translateText(["templateExampleEffectiveDate"])
      },
      resourceHeaders,
      policies: assignablePolicies
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="body2 text-secondary-text">
        {translateText(["addPoliciesDescription"])}
      </p>

      <div className="flex flex-row justify-end gap-3">
        <ButtonV2
          variant="tertiary"
          onClick={handleTemplateDownload}
          isLoading={isLoading}
          disabled={isLoading}
          icon={<Icon name={IconName.DOWNLOAD_ICON} />}
          iconPosition="end"
        >
          {translateText(["downloadTemplateLink"])}
        </ButtonV2>
        <ButtonV2
          variant="primary"
          onClick={onContinue}
          icon={<Icon name={IconName.RIGHT_ARROW_ICON} />}
          iconPosition="end"
        >
          {translateText(["continueBtnTxt"])}
        </ButtonV2>
      </div>
    </div>
  );
};

export default BulkAssignPolicyInstructionsStep;
