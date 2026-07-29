import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { BulkAssignPolicyResponse } from "~community/leave/types/LeavePolicyTypes";
import { downloadBulkAssignErrorReport } from "~community/leave/utils/bulkAssignPolicyUtils";

interface Props {
  response: BulkAssignPolicyResponse | null;
  onDone: () => void;
}

const BulkAssignPolicySummaryStep: FC<Props> = ({ response, onDone }) => {
  const translateText = useTranslator(
    "leaveModule",
    "leavePolicies",
    "bulkAssignModal"
  );

  if (!response) {
    return null;
  }

  const { successCount, failedCount } = response.bulkStatusSummary;

  const getSummaryText = (): string => {
    if (failedCount === 0) {
      return translateText(["summaryAllSuccess"], { successCount });
    }
    if (successCount === 0) {
      return translateText(["summaryAllFailed"], { failedCount });
    }
    return translateText(["summaryPartial"], { successCount, failedCount });
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm font-semibold">{translateText(["summaryTitle"])}</p>
      <p className="text-sm text-secondary-text" aria-live="polite">
        {getSummaryText()}
      </p>

      <div className="flex flex-row justify-end gap-3">
        {failedCount > 0 && (
          <ButtonV2
            variant="tertiary"
            onClick={() => downloadBulkAssignErrorReport(response)}
            icon={<Icon name={IconName.DOWNLOAD_ICON} />}
            iconPosition="end"
          >
            {translateText(["downloadErrorReportBtnTxt"])}
          </ButtonV2>
        )}
        <ButtonV2 variant="primary" onClick={onDone}>
          {translateText(["doneBtnTxt"])}
        </ButtonV2>
      </div>
    </div>
  );
};

export default BulkAssignPolicySummaryStep;
