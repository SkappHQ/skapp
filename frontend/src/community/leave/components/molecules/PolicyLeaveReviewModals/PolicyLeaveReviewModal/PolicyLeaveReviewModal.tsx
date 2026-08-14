import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import CheckIcon from "~community/common/assets/Icons/CheckIcon";
import CloseIcon from "~community/common/assets/Icons/CloseIcon";
import CopyIcon from "~community/common/assets/Icons/CopyIcon";
import ReadOnlyChip from "~community/common/components/atoms/Chips/BasicChip/ReadOnlyChip";
import IconChip from "~community/common/components/atoms/Chips/IconChip.tsx/IconChip";
import Avatar from "~community/common/components/molecules/Avatar/Avatar";
import { FileTypes } from "~community/common/enums/CommonEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import LeaveStatusPopupColumn from "~community/leave/components/molecules/ManagerLeaveModalContents/LeaveStatusPopupColumn/LeaveStatusPopupColumn";
import {
  POLICY_LEAVE_ATTACHMENT_CHIP_STYLES,
  POLICY_LEAVE_CHIP_STYLES
} from "~community/leave/constants/policyLeaveReviewConstants";
import {
  PolicyLeaveReviewModalEnums,
  PolicyLeaveReviewToastEnums
} from "~community/leave/enums/PolicyLeaveReviewEnums";
import { useDownloadAttachment } from "~community/leave/hooks/useDownloadAttachment";
import usePolicyLeaveReviewAction from "~community/leave/hooks/usePolicyLeaveReviewAction";
import {
  PolicyLeavePopupType,
  PolicyLeaveRequestDetailType
} from "~community/leave/types/PolicyLeaveReviewTypes";
import {
  PolicyLeaveAttachmentType,
  PolicyLeaveRequestStatus
} from "~community/leave/types/PolicyLeaveTypes";
import { getFileNameOfAttachmentFromUrl } from "~community/leave/utils/getFileNameofAttachedFiles/getFileNamesofAttachments";
import { getStartEndDate } from "~community/leave/utils/leaveRequest/LeaveRequestUtils";
import { getPolicyLeaveDurationLabel } from "~community/leave/utils/policyLeave/policyLeaveDurationUtils";
import { GoogleAnalyticsTypes } from "~enterprise/common/types/GoogleAnalyticsTypes";

interface Props {
  request: PolicyLeaveRequestDetailType;
  setPopupType: (popupType: PolicyLeavePopupType) => void;
}

const PolicyLeaveReviewModal: FC<Props> = ({ request, setPopupType }) => {
  const translateText = useTranslator(
    "leaveModule",
    "leaveRequests",
    "leaveManagerEmployee"
  );
  const translateLeaveModuleText = useTranslator("leaveModule");
  const commonTranslateText = useTranslator("words");
  const translateAria = useTranslator("leaveAria", "allLeaveRequests");

  const { handleDownloadAttachment } = useDownloadAttachment({
    fileType: FileTypes.LEAVE_ATTACHMENTS
  });

  const { reviewRequest: approveRequest, isPending } =
    usePolicyLeaveReviewAction({
      status: PolicyLeaveRequestStatus.APPROVED,
      successToast: PolicyLeaveReviewToastEnums.APPROVE_SUCCESS,
      errorToast: PolicyLeaveReviewToastEnums.APPROVE_ERROR,
      analyticsEvent: GoogleAnalyticsTypes.GA4_LEAVE_REQUEST_APPROVED,
      onSuccess: () => setPopupType(PolicyLeaveReviewModalEnums.APPROVED_STATUS)
    });

  const handleApprove = (): void => {
    approveRequest(request.leaveRequestId, "");
  };

  const handleDeclineModel = (): void => {
    setPopupType(PolicyLeaveReviewModalEnums.DECLINE);
  };

  const getAttachmentLabel = (attachment: PolicyLeaveAttachmentType): string =>
    attachment.originalFileName ||
    getFileNameOfAttachmentFromUrl(attachment.fileUrl) ||
    translateText(["uploadedAttachment"]);

  return (
    <div>
      <div className="flex flex-row justify-between mb-3">
        <fieldset
          className="flex flex-row items-center gap-3"
          aria-label={translateAria(["employeeName"], {
            firstName: request.employee.firstName,
            lastName: request.employee.lastName
          })}
        >
          <div aria-hidden="true">
            <Avatar
              firstName={request.employee.firstName ?? ""}
              lastName={request.employee.lastName ?? ""}
              src={request.employee.authPic ?? ""}
            />
          </div>
          <span className="text-base" aria-hidden="true">
            {translateText(["employeeName"], {
              employeeName: request.employee.firstName
            }) ?? ""}
          </span>
        </fieldset>
        <fieldset
          aria-label={translateAria(["leaveType"], {
            leaveType: request.leaveType.name
          })}
        >
          <IconChip
            accessibility={{
              ariaLabel: request.leaveType.name,
              ariaHidden: true
            }}
            label={request.leaveType.name}
            isTruncated={false}
            icon={request.leaveType.emojiCode}
            chipStyles={POLICY_LEAVE_CHIP_STYLES}
            tabIndex={-1}
          />
        </fieldset>
      </div>

      <div className="max-h-[50vh] overflow-auto">
        <div className="pt-3 pb-4">
          <div className="flex flex-row justify-between items-center pb-4">
            <span className="text-base">{translateText(["duration"])}:</span>
            <div className="flex flex-row gap-2">
              <ReadOnlyChip
                label={getPolicyLeaveDurationLabel(
                  request.durationDays,
                  request.leaveState,
                  translateLeaveModuleText,
                  commonTranslateText(["days"])
                )}
                chipStyles={POLICY_LEAVE_CHIP_STYLES}
              />
              <ReadOnlyChip
                label={getStartEndDate(request.startDate, request.endDate)}
                chipStyles={POLICY_LEAVE_CHIP_STYLES}
              />
            </div>
          </div>
          <LeaveStatusPopupColumn
            label={translateText(["reason"])}
            text={
              translateText(["reasonData"], {
                reason: request.requestDesc ?? ""
              }) ?? ""
            }
            isDisabled={true}
            tabIndex={0}
          />
          {request.attachments && request.attachments.length > 0 && (
            <div className="pt-4 flex flex-col gap-2">
              <p className="text-base">{translateText(["attachments"])}</p>

              <div>
                {request.attachments.map((attachment) => (
                  <IconChip
                    accessibility={{
                      ariaLabel: translateAria(["attachment"], {
                        fileName: getAttachmentLabel(attachment)
                      })
                    }}
                    key={attachment.id}
                    label={getAttachmentLabel(attachment)}
                    chipStyles={POLICY_LEAVE_ATTACHMENT_CHIP_STYLES}
                    icon={<CopyIcon />}
                    onClick={() => handleDownloadAttachment(attachment.fileUrl)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-row gap-4 mt-4 justify-end">
        <ButtonV2
          variant={"error"}
          onClick={handleDeclineModel}
          disabled={isPending}
          aria-label={translateText(["cancelAreaLabel"])}
          icon={<CloseIcon fill="var(--color-primary-text)" />}
          iconPosition="end"
        >
          {translateText(["declineLeave"])}
        </ButtonV2>
        <ButtonV2
          onClick={handleApprove}
          isLoading={isPending}
          aria-label={translateText(["approveAreaLabel"])}
          icon={<CheckIcon />}
          iconPosition="end"
        >
          {translateText(["approveLeave"])}
        </ButtonV2>
      </div>
    </div>
  );
};

export default PolicyLeaveReviewModal;
