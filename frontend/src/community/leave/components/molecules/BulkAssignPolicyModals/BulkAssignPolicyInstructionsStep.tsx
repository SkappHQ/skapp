import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
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

  return (
    <div className="flex flex-col gap-4">
      <p className="body2 text-secondary-text">
        {translateText(["addPoliciesDescription"])}
      </p>

      <div className="flex flex-row justify-end gap-3">
        <ButtonV2
          variant="tertiary"
          onClick={downloadBulkAssignPolicyTemplate}
          icon={
            <Icon
              name={IconName.DOWNLOAD_ICON}
              fill="var(--color-primary-text)"
            />
          }
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
