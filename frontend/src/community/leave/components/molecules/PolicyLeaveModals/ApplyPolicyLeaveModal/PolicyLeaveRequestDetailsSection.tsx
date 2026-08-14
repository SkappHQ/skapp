import { ChangeEvent, FC } from "react";

import { useStorageAvailability } from "~community/common/api/StorageAvailabilityApi";
import TextArea from "~community/common/components/atoms/TextArea/TextArea";
import DurationSelector from "~community/common/components/molecules/DurationSelector/DurationSelector";
import { daysTypes } from "~community/common/constants/stringConstants";
import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import {
  FileUploadType,
  LeaveStates
} from "~community/common/types/CommonTypes";
import { IconName } from "~community/common/types/IconTypes";
import { DurationSelectorDisabledOptions } from "~community/common/types/MoleculeTypes";
import AttachmentSummary from "~community/leave/components/molecules/AttachmentSummary/AttachmentSummary";
import LeaveSummary from "~community/leave/components/molecules/LeaveSummary/LeaveSummary";
import PolicyTeamAvailabilityCard from "~community/leave/components/molecules/PolicyTeamAvailabilityCard/PolicyTeamAvailabilityCard";
import { MAX_POLICY_LEAVE_COMMENT_LENGTH } from "~community/leave/constants/stringConstants";
import { PolicyLeaveModalEnums } from "~community/leave/enums/PolicyLeaveEnums";
import { usePolicyLeaveStore } from "~community/leave/store/policyLeaveStore";
import { ResourceAvailabilityPayload } from "~community/leave/types/MyRequests";
import { EmployeePolicyBalanceType } from "~community/leave/types/PolicyLeaveTypes";
import { getIsStorageFull } from "~community/leave/utils/policyLeave/policyLeaveUtils";
import { TeamNamesType } from "~community/people/types/TeamTypes";
import { useGetEnvironment } from "~enterprise/common/hooks/useGetEnvironment";

interface Props {
  policyBalance: EmployeePolicyBalanceType;
  myTeams: TeamNamesType[] | undefined;
  resourceAvailability: ResourceAvailabilityPayload[] | undefined;
  workingDays: daysTypes[];
  disabledDurationOptions: DurationSelectorDisabledOptions;
  isSummaryVisible: boolean;
}

const PolicyLeaveRequestDetailsSection: FC<Props> = ({
  policyBalance,
  myTeams,
  resourceAvailability,
  workingDays,
  disabledDurationOptions,
  isSummaryVisible
}) => {
  const translateText = useTranslator(
    "leaveModule",
    "myRequests",
    "applyPolicyLeaveModal"
  );
  const translateAria = useTranslator("leaveAria", "applyLeave");
  const translateStorageText = useTranslator("StorageToastMessage");

  const { setToastMessage } = useToast();
  const environment = useGetEnvironment();

  const {
    selectedDates,
    selectedDuration,
    comment,
    attachments,
    formErrors,
    setSelectedDuration,
    setComment,
    setAttachments,
    setModalType
  } = usePolicyLeaveStore((state) => ({
    selectedDates: state.selectedDates,
    selectedDuration: state.selectedDuration,
    comment: state.comment,
    attachments: state.attachments,
    formErrors: state.formErrors,
    setSelectedDuration: state.setSelectedDuration,
    setComment: state.setComment,
    setAttachments: state.setAttachments,
    setModalType: state.setModalType
  }));

  const { data: storageAvailabilityData } = useStorageAvailability();

  const handleCommentChange = (
    event: ChangeEvent<HTMLTextAreaElement>
  ): void => {
    setComment(event.target.value);
  };

  const handleAttachmentIconClick = (): void => {
    const isStorageFull = getIsStorageFull({
      environment,
      availableSpace: storageAvailabilityData?.availableSpace
    });

    if (isStorageFull) {
      setToastMessage({
        open: true,
        toastType: ToastType.ERROR,
        title: translateStorageText(["storageTitle"]),
        description: translateStorageText(["contactAdminText"]),
        isIcon: true
      });
      return;
    }

    setModalType(PolicyLeaveModalEnums.ADD_ATTACHMENT);
  };

  const handleDeleteAttachment = (attachment: FileUploadType): void => {
    setAttachments(attachments.filter((item) => item !== attachment));
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {selectedDates.length > 0 && myTeams?.length ? (
        <PolicyTeamAvailabilityCard
          teams={myTeams}
          resourceAvailability={resourceAvailability}
        />
      ) : null}
      <DurationSelector
        label={translateText(["selectDuration"])}
        onChange={setSelectedDuration}
        options={{
          fullDay: LeaveStates.FULL_DAY,
          halfDayMorning: LeaveStates.MORNING,
          halfDayEvening: LeaveStates.EVENING
        }}
        disabledOptions={disabledDurationOptions}
        value={selectedDuration}
      />
      <TextArea
        label={translateText(["comment"])}
        ariaLabel={{ icon: translateAria(["comment.icon"]) }}
        placeholder={translateText(["addComment"])}
        isRequired={policyBalance.leaveType.isCommentMust}
        isAttachmentRequired={policyBalance.leaveType.isAttachmentMust}
        maxLength={MAX_POLICY_LEAVE_COMMENT_LENGTH}
        name="comment"
        value={comment}
        onChange={handleCommentChange}
        iconName={
          policyBalance.leaveType.isAttachment
            ? IconName.ATTACHMENT_ICON
            : undefined
        }
        onIconClick={handleAttachmentIconClick}
        error={{
          comment: formErrors?.comment,
          attachment: formErrors?.attachment
        }}
      />
      <AttachmentSummary
        attachments={attachments}
        onDeleteBtnClick={handleDeleteAttachment}
      />
      {isSummaryVisible && (
        <LeaveSummary
          leaveTypeName={policyBalance.policyName}
          leaveTypeEmoji={policyBalance.leaveType.emojiCode}
          leaveDuration={selectedDuration}
          startDate={selectedDates[0]}
          endDate={selectedDates[1]}
          resourceAvailability={resourceAvailability}
          workingDays={workingDays}
        />
      )}
    </div>
  );
};

export default PolicyLeaveRequestDetailsSection;
