import { Theme, useTheme } from "@mui/material";
import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useRef } from "react";

import { useUploadImages } from "~community/common/api/FileHandleApi";
import { useStorageAvailability } from "~community/common/api/StorageAvailabilityApi";
import Icon from "~community/common/components/atoms/Icon/Icon";
import TextArea from "~community/common/components/atoms/TextArea/TextArea";
import CalendarDateRangePicker from "~community/common/components/molecules/CalendarDateRangePicker/CalendarDateRangePicker";
import DurationSelector from "~community/common/components/molecules/DurationSelector/DurationSelector";
import { appModes } from "~community/common/constants/configs";
import ROUTES from "~community/common/constants/routes";
import { FileTypes } from "~community/common/enums/CommonEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import {
  FileUploadType,
  LeaveStates
} from "~community/common/types/CommonTypes";
import { IconName } from "~community/common/types/IconTypes";
import {
  convertToYYYYMMDDFromDateTime,
  currentYear,
  getMonthStartAndEndDates
} from "~community/common/utils/dateTimeUtils";
import { NINETY_PERCENT } from "~community/common/utils/getConstants";
import { useDefaultCapacity } from "~community/configurations/api/timeConfigurationApi";
import { useGetResourceAvailability } from "~community/leave/api/MyRequestApi";
import {
  useApplyPolicyLeave,
  useCheckPolicyLeaveAvailability,
  useGetMyPolicyLeaveRequests
} from "~community/leave/api/PolicyLeaveApi";
import AttachmentSummary from "~community/leave/components/molecules/AttachmentSummary/AttachmentSummary";
import LeaveSummary from "~community/leave/components/molecules/LeaveSummary/LeaveSummary";
import PolicyLeaveBalanceCard from "~community/leave/components/molecules/PolicyLeaveBalanceCard/PolicyLeaveBalanceCard";
import PolicyTeamAvailabilityCard from "~community/leave/components/molecules/PolicyTeamAvailabilityCard/PolicyTeamAvailabilityCard";
import { LeaveDurationTypes } from "~community/leave/enums/LeaveTypeEnums";
import { LeaveStatusEnums } from "~community/leave/enums/MyRequestEnums";
import {
  PolicyLeaveModalEnums,
  PolicyLeaveToastEnums
} from "~community/leave/enums/PolicyLeaveEnums";
import { usePolicyLeaveStore } from "~community/leave/store/policyLeaveStore";
import { useLeaveStore } from "~community/leave/store/store";
import { MyLeaveRequestPayloadType } from "~community/leave/types/MyRequests";
import {
  PolicyLeaveAttachmentPayload,
  PolicyLeaveRequestStatus
} from "~community/leave/types/PolicyLeaveTypes";
import {
  getDurationInitialValue,
  getDurationSelectorDisabledOptions
} from "~community/leave/utils/myRequests/applyLeaveModalUtils";
import {
  getAvailabilityErrorMessage,
  getPolicyLeaveFormErrors,
  handlePolicyLeaveToast,
  hasPolicyLeaveFormErrors,
  mapApplyErrorKeyToToastType
} from "~community/leave/utils/policyLeave/policyLeaveUtils";
import { useGetAllHolidays } from "~community/people/api/HolidayApi";
import {
  useGetEmployeeById,
  useGetUserPersonalDetails
} from "~community/people/api/PeopleApi";
import { useGetMyTeams } from "~community/people/api/TeamApi";
import { useGetEnvironment } from "~enterprise/common/hooks/useGetEnvironment";
import { FileCategories } from "~enterprise/common/types/s3Types";
import { uploadFileToS3ByUrl } from "~enterprise/common/utils/awsS3ServiceFunctions";

const SESSION_EXPIRED_REDIRECT_DELAY_MS = 2000;

const HTTP_UNAUTHORIZED = 401;

const ApplyPolicyLeaveModal = () => {
  const theme: Theme = useTheme();
  const router = useRouter();
  const { setToastMessage } = useToast();
  const environment = useGetEnvironment();
  const dateFieldRef = useRef<HTMLDivElement>(null);

  const translateStorageText = useTranslator("StorageToastMessage");
  const translateText = useTranslator(
    "leaveModule",
    "myRequests",
    "applyPolicyLeaveModal"
  );
  const translateAria = useTranslator("leaveAria", "applyLeave");

  const {
    selectedYear,
    selectedPolicyBalance,
    selectedDates,
    selectedMonth,
    selectedTeam,
    selectedDuration,
    comment,
    attachments,
    formErrors,
    availability,
    setSelectedDates,
    setSelectedMonth,
    setSelectedTeam,
    setSelectedDuration,
    setComment,
    setAttachments,
    setFormError,
    setFormErrors,
    setAvailability,
    setModalType
  } = usePolicyLeaveStore();

  const isCalendarSelectionInvalid = useLeaveStore(
    (state) => state.isApplyLeaveModalBtnDisabled
  );

  const { data: timeConfig } = useDefaultCapacity();
  const { data: myTeams } = useGetMyTeams();
  const { data: myPolicyLeaveRequests } =
    useGetMyPolicyLeaveRequests(selectedYear);
  const { data: currentEmployee } = useGetUserPersonalDetails();

  const { data: employeeData, isLoading: isEmployeeDataLoading } =
    useGetEmployeeById(
      currentEmployee?.employeeId ? Number(currentEmployee.employeeId) : 0
    );

  const workLocationId =
    employeeData?.employment?.employmentDetails?.workLocationId;

  const { data: allHolidays } = useGetAllHolidays(
    currentYear.toString(),
    true,
    undefined,
    workLocationId,
    !isEmployeeDataLoading
  );

  const { data: storageAvailabilityData } = useStorageAvailability();
  const { mutateAsync: uploadAttachments } = useUploadImages();

  const { mutate: checkAvailability } = useCheckPolicyLeaveAvailability(
    (data) => setAvailability(data)
  );

  const onApplySuccess = () => {
    handlePolicyLeaveToast({
      type: PolicyLeaveToastEnums.APPLY_SUCCESS,
      setToastMessage,
      translateText
    });
    setModalType(PolicyLeaveModalEnums.NONE);
  };

  const onApplyError = (messageKey: string, statusCode?: number) => {
    if (statusCode === HTTP_UNAUTHORIZED) {
      handlePolicyLeaveToast({
        type: PolicyLeaveToastEnums.SESSION_EXPIRED,
        setToastMessage,
        translateText
      });
      setTimeout(() => {
        void router.push(ROUTES.AUTH.SIGNIN);
      }, SESSION_EXPIRED_REDIRECT_DELAY_MS);
      return;
    }

    handlePolicyLeaveToast({
      type: mapApplyErrorKeyToToastType(messageKey),
      setToastMessage,
      translateText
    });
  };

  const { mutate: applyPolicyLeave, isPending: isApplyPending } =
    useApplyPolicyLeave(selectedYear, onApplySuccess, onApplyError);

  const minDate = useMemo(
    () => new Date(selectedPolicyBalance?.validFrom ?? Date.now()),
    [selectedPolicyBalance]
  );

  const maxDate = useMemo(
    () => new Date(selectedPolicyBalance?.validTo ?? Date.now()),
    [selectedPolicyBalance]
  );

  const usedStoragePercentage = useMemo(
    () => 100 - (storageAvailabilityData?.availableSpace ?? 0),
    [storageAvailabilityData]
  );

  const workingDays = useMemo(
    () => timeConfig?.map((config) => config.day) || [],
    [timeConfig]
  );

  const blockingLeaveRequests: MyLeaveRequestPayloadType[] = useMemo(
    () =>
      (myPolicyLeaveRequests ?? [])
        .filter(
          (request) =>
            request.status === PolicyLeaveRequestStatus.PENDING ||
            request.status === PolicyLeaveRequestStatus.APPROVED
        )
        .map((request) => ({
          leaveRequestId: request.leaveRequestId,
          startDate: request.startDate,
          endDate: request.endDate,
          leaveType: {
            typeId: request.leaveType.id,
            name: request.leaveType.name,
            emojiCode: request.leaveType.emojiCode,
            colorCode: request.leaveType.colorCode
          },
          leaveState: request.leaveState,
          status: request.status as unknown as LeaveStatusEnums,
          isViewed: request.isViewed,
          durationDays: request.durationDays,
          requestDesc: request.requestDesc ?? ""
        })),
    [myPolicyLeaveRequests]
  );

  const startAndEndDates = useMemo(
    () => getMonthStartAndEndDates(selectedMonth),
    [selectedMonth]
  );

  useEffect(() => {
    if (!selectedTeam && myTeams && myTeams.length > 0) {
      setSelectedTeam(myTeams[0] ?? null);
    }
  }, [myTeams, selectedTeam, setSelectedTeam]);

  const { data: resourceAvailability } = useGetResourceAvailability({
    teams: selectedTeam !== null ? (selectedTeam.teamId as number) : null,
    startDate: startAndEndDates.start,
    endDate: startAndEndDates.end
  });

  const disabledDurationSelectorOptions = useMemo(
    () =>
      getDurationSelectorDisabledOptions({
        selectedDates,
        duration:
          selectedPolicyBalance?.leaveType?.minDuration ??
          LeaveDurationTypes.NONE,
        myLeaveRequests: blockingLeaveRequests,
        allHolidays
      }),
    [
      selectedDates,
      selectedPolicyBalance?.leaveType?.minDuration,
      blockingLeaveRequests,
      allHolidays
    ]
  );

  useEffect(() => {
    setSelectedDuration(
      getDurationInitialValue({
        allowedDurations:
          selectedPolicyBalance?.leaveType?.minDuration ??
          LeaveDurationTypes.NONE,
        disabledOptions: disabledDurationSelectorOptions
      })
    );
  }, [
    selectedPolicyBalance?.leaveType?.minDuration,
    disabledDurationSelectorOptions,
    setSelectedDuration
  ]);

  useEffect(() => {
    if (
      !selectedPolicyBalance ||
      selectedDates.length === 0 ||
      selectedDuration === LeaveStates.NONE
    ) {
      setAvailability(null);
      return;
    }

    checkAvailability({
      policyId: selectedPolicyBalance.policyId,
      startDate: convertToYYYYMMDDFromDateTime(selectedDates[0]),
      endDate: convertToYYYYMMDDFromDateTime(
        selectedDates[1] ?? selectedDates[0]
      ),
      leaveState: selectedDuration
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDates, selectedDuration, selectedPolicyBalance?.policyId]);

  const availabilityError = useMemo(() => {
    if (!availability || availability.isValid || !selectedPolicyBalance) {
      return "";
    }
    return getAvailabilityErrorMessage({
      failureReason: availability.failureReason,
      remainingBalance: availability.remainingBalance,
      policyName: selectedPolicyBalance.policyName,
      translateText
    });
  }, [availability, selectedPolicyBalance, translateText]);

  useEffect(() => {
    setFormError("selectedDates", availabilityError);
  }, [availabilityError, setFormError]);

  const hasDateError = Boolean(formErrors?.selectedDates);

  useEffect(() => {
    if (hasDateError) {
      dateFieldRef.current?.focus();
    }
  }, [hasDateError]);

  const validate = useCallback(() => {
    const errors = getPolicyLeaveFormErrors({
      selectedDatesLength: selectedDates.length,
      comment,
      attachments,
      policyBalance: selectedPolicyBalance,
      availabilityError,
      translateText
    });
    setFormErrors(errors);
    return !hasPolicyLeaveFormErrors(errors);
  }, [
    selectedDates.length,
    comment,
    attachments,
    selectedPolicyBalance,
    availabilityError,
    setFormErrors,
    translateText
  ]);

  const uploadAttachmentsAndGetRefs = async (): Promise<
    PolicyLeaveAttachmentPayload[]
  > => {
    if (attachments.length === 0) {
      return [];
    }

    const uploadOne = async (
      attachment: FileUploadType
    ): Promise<PolicyLeaveAttachmentPayload | null> => {
      if (!attachment.file) {
        return null;
      }

      if (environment === appModes.COMMUNITY) {
        const formData = new FormData();
        formData.append("file", attachment.file);
        formData.append("type", FileTypes.LEAVE_ATTACHMENTS);
        const response = await uploadAttachments(formData);
        const filePath = response.message?.split(
          "File uploaded successfully: "
        )[1];
        const fileUrl = filePath?.split("/").pop();
        return fileUrl ? { fileUrl, originalFileName: attachment.name } : null;
      }

      const fileUrl = await uploadFileToS3ByUrl(
        attachment.file as File,
        FileCategories.LEAVE_REQUEST
      );
      return fileUrl ? { fileUrl, originalFileName: attachment.name } : null;
    };

    const uploaded = await Promise.all(attachments.map(uploadOne));
    return uploaded.filter(
      (ref): ref is PolicyLeaveAttachmentPayload => ref !== null
    );
  };

  const onSubmit = async () => {
    if (!selectedPolicyBalance || !validate()) {
      return;
    }

    try {
      const attachmentRefs = await uploadAttachmentsAndGetRefs();

      applyPolicyLeave({
        policyId: selectedPolicyBalance.policyId,
        startDate: convertToYYYYMMDDFromDateTime(selectedDates[0]),
        endDate: convertToYYYYMMDDFromDateTime(
          selectedDates[1] ?? selectedDates[0]
        ),
        leaveState: selectedDuration,
        requestDesc: comment,
        attachments: attachmentRefs
      });
    } catch {
      handlePolicyLeaveToast({
        type: PolicyLeaveToastEnums.APPLY_ERROR,
        setToastMessage,
        translateText
      });
    }
  };

  if (!selectedPolicyBalance) {
    return null;
  }

  const hasUnsavedChanges =
    selectedDates.length > 0 || comment.trim() !== "" || attachments.length > 0;

  const isSubmitDisabled =
    selectedDates.length === 0 ||
    selectedDuration === LeaveStates.NONE ||
    isCalendarSelectionInvalid ||
    !!availabilityError;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col md:flex-row gap-3 md:gap-7">
        <div className="flex flex-col gap-3">
          <div
            ref={dateFieldRef}
            tabIndex={-1}
            role="group"
            aria-invalid={hasDateError}
            aria-label={translateAria(["calendar", "selectDateForLeave"])}
            style={
              hasDateError
                ? {
                    border: `0.0625rem solid ${theme.palette.error.main}`,
                    borderRadius: "0.5rem"
                  }
                : undefined
            }
          >
            <CalendarDateRangePicker
              selectedDates={selectedDates}
              setSelectedDates={setSelectedDates}
              setSelectedMonth={setSelectedMonth}
              allowedDuration={selectedPolicyBalance.leaveType.minDuration}
              allHolidays={allHolidays}
              minDate={minDate}
              maxDate={maxDate}
              workingDays={workingDays}
              myLeaveRequests={blockingLeaveRequests}
              error={formErrors?.selectedDates}
            />
          </div>
          <div className="flex flex-row items-center gap-2">
            <p>
              {translateText(["myPolicyBalance"], {
                policyName: selectedPolicyBalance.policyName
              }) ?? ""}
            </p>
            <PolicyLeaveBalanceCard policyBalance={selectedPolicyBalance} />
          </div>
        </div>
        <div className="flex flex-col gap-3 w-full">
          {selectedDates.length && myTeams?.length ? (
            <PolicyTeamAvailabilityCard
              teams={myTeams}
              resourceAvailability={resourceAvailability}
            />
          ) : (
            <></>
          )}
          <DurationSelector
            label={translateText(["selectDuration"])}
            onChange={(value) => setSelectedDuration(value)}
            options={{
              fullDay: LeaveStates.FULL_DAY,
              halfDayMorning: LeaveStates.MORNING,
              halfDayEvening: LeaveStates.EVENING
            }}
            disabledOptions={disabledDurationSelectorOptions}
            value={selectedDuration}
          />
          <TextArea
            label={translateText(["comment"])}
            ariaLabel={{ icon: translateAria(["comment.icon"]) }}
            placeholder={translateText(["addComment"])}
            isRequired={selectedPolicyBalance.leaveType.isCommentMust}
            isAttachmentRequired={
              selectedPolicyBalance.leaveType.isAttachmentMust
            }
            maxLength={255}
            name="comment"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            iconName={
              selectedPolicyBalance.leaveType.isAttachment
                ? IconName.ATTACHMENT_ICON
                : undefined
            }
            onIconClick={() => {
              process.env.NEXT_PUBLIC_MODE === appModes.COMMUNITY &&
              usedStoragePercentage >= NINETY_PERCENT
                ? setToastMessage({
                    open: true,
                    toastType: "error",
                    title: translateStorageText(["storageTitle"]),
                    description: translateStorageText(["contactAdminText"]),
                    isIcon: true
                  })
                : setModalType(PolicyLeaveModalEnums.ADD_ATTACHMENT);
            }}
            error={{
              comment: formErrors?.comment,
              attachment: formErrors?.attachment
            }}
          />
          <AttachmentSummary
            attachments={attachments}
            onDeleteBtnClick={(attachment) =>
              setAttachments(attachments.filter((a) => a !== attachment))
            }
          />
          {!isSubmitDisabled && (
            <LeaveSummary
              leaveTypeName={selectedPolicyBalance.policyName}
              leaveTypeEmoji={selectedPolicyBalance.leaveType.emojiCode}
              leaveDuration={selectedDuration}
              startDate={selectedDates[0]}
              endDate={selectedDates[1]}
              resourceAvailability={resourceAvailability}
              workingDays={workingDays}
            />
          )}
        </div>
      </div>
      <div className="flex flex-row gap-3 mt-4 justify-end">
        <ButtonV2
          variant={"tertiary"}
          onClick={() =>
            setModalType(
              hasUnsavedChanges
                ? PolicyLeaveModalEnums.DISCARD_CHANGES
                : PolicyLeaveModalEnums.NONE
            )
          }
          icon={<Icon name={IconName.CLOSE_ICON} />}
          iconPosition="end"
        >
          {translateText(["cancelBtn"])}
        </ButtonV2>
        <ButtonV2
          variant={"primary"}
          onClick={onSubmit}
          isLoading={isApplyPending}
          disabled={isSubmitDisabled || isApplyPending}
          aria-label={translateAria(["confirmApplyLeave"])}
          icon={<Icon name={IconName.TICK_ICON} />}
          iconPosition="end"
        >
          {translateText(["submitBtn"])}
        </ButtonV2>
      </div>
    </div>
  );
};

export default ApplyPolicyLeaveModal;
