import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

import { useUploadImages } from "~community/common/api/FileHandleApi";
import { useStorageAvailability } from "~community/common/api/StorageAvailabilityApi";
import Icon from "~community/common/components/atoms/Icon/Icon";
import TextArea from "~community/common/components/atoms/TextArea/TextArea";
import CalendarDateRangePicker from "~community/common/components/molecules/CalendarDateRangePicker/CalendarDateRangePicker";
import DurationSelector from "~community/common/components/molecules/DurationSelector/DurationSelector";
import { appModes } from "~community/common/constants/configs";
import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import {
  FileUploadType,
  LeaveStates
} from "~community/common/types/CommonTypes";
import { IconName } from "~community/common/types/IconTypes";
import {
  convertToYYYYMMDDFromDateTime,
  convertYYYYMMDDToDateTime,
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
import {
  MAX_POLICY_LEAVE_COMMENT_LENGTH,
  TOTAL_PERCENTAGE
} from "~community/leave/constants/stringConstants";
import { LeaveDurationTypes } from "~community/leave/enums/LeaveTypeEnums";
import {
  PolicyLeaveModalEnums,
  PolicyLeaveToastEnums
} from "~community/leave/enums/PolicyLeaveEnums";
import { usePolicyLeaveStore } from "~community/leave/store/policyLeaveStore";
import { useLeaveStore } from "~community/leave/store/store";
import { MyLeaveRequestPayloadType } from "~community/leave/types/MyRequests";
import {
  getDurationInitialValue,
  getDurationSelectorDisabledOptions
} from "~community/leave/utils/myRequests/applyLeaveModalUtils";
import { uploadPolicyLeaveAttachments } from "~community/leave/utils/policyLeave/policyLeaveAttachmentUtils";
import {
  getAvailabilityErrorMessage,
  getPolicyLeaveFormErrors,
  handlePolicyLeaveToast,
  hasPolicyLeaveFormErrors,
  mapApplyErrorKeyToToastType,
  selectHasUnsavedChanges,
  toLeaveStatus
} from "~community/leave/utils/policyLeave/policyLeaveUtils";
import { useGetAllHolidays } from "~community/people/api/HolidayApi";
import {
  useGetEmployeeById,
  useGetUserPersonalDetails
} from "~community/people/api/PeopleApi";
import { useGetMyTeams } from "~community/people/api/TeamApi";
import { useGetEnvironment } from "~enterprise/common/hooks/useGetEnvironment";
import useGoogleAnalyticsEvent from "~enterprise/common/hooks/useGoogleAnalyticsEvent";
import { GoogleAnalyticsTypes } from "~enterprise/common/types/GoogleAnalyticsTypes";

const ApplyPolicyLeaveModal = () => {
  const { setToastMessage } = useToast();
  const environment = useGetEnvironment();
  const { sendEvent } = useGoogleAnalyticsEvent();
  const dateFieldRef = useRef<HTMLFieldSetElement>(null);
  const availabilityRequestIdRef = useRef(0);

  const [hasAvailabilityCheckFailed, setHasAvailabilityCheckFailed] =
    useState(false);

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

  const hasUnsavedChanges = usePolicyLeaveStore(selectHasUnsavedChanges);

  const policyStartYear = selectedPolicyBalance
    ? convertYYYYMMDDToDateTime(selectedPolicyBalance.validFrom).year.toString()
    : selectedYear;
  const policyEndYear = selectedPolicyBalance
    ? convertYYYYMMDDToDateTime(selectedPolicyBalance.validTo).year.toString()
    : selectedYear;
  const spansTwoYears = policyStartYear !== policyEndYear;

  const { data: timeConfig } = useDefaultCapacity();
  const { data: myTeams } = useGetMyTeams();
  const { data: requestsInStartYear } =
    useGetMyPolicyLeaveRequests(policyStartYear);
  const { data: requestsInEndYear } = useGetMyPolicyLeaveRequests(
    policyEndYear,
    spansTwoYears
  );
  const { data: currentEmployee } = useGetUserPersonalDetails();

  const { data: employeeData, isLoading: isEmployeeDataLoading } =
    useGetEmployeeById(
      currentEmployee?.employeeId ? Number(currentEmployee.employeeId) : 0
    );

  const workLocationId =
    employeeData?.employment?.employmentDetails?.workLocationId;

  const { data: holidaysInStartYear } = useGetAllHolidays(
    policyStartYear,
    true,
    undefined,
    workLocationId,
    !isEmployeeDataLoading
  );

  const { data: holidaysInEndYear } = useGetAllHolidays(
    policyEndYear,
    true,
    undefined,
    workLocationId,
    !isEmployeeDataLoading && spansTwoYears
  );

  const allHolidays = useMemo(
    () => [
      ...(holidaysInStartYear ?? []),
      ...(spansTwoYears ? (holidaysInEndYear ?? []) : [])
    ],
    [holidaysInStartYear, holidaysInEndYear, spansTwoYears]
  );

  const { data: storageAvailabilityData } = useStorageAvailability();
  const { mutateAsync: uploadAttachments } = useUploadImages();

  const { mutate: checkAvailability } = useCheckPolicyLeaveAvailability();

  const onApplySuccess = () => {
    handlePolicyLeaveToast({
      type: PolicyLeaveToastEnums.APPLY_SUCCESS,
      setToastMessage,
      translateText
    });
    sendEvent(GoogleAnalyticsTypes.GA4_LEAVE_REQUEST_APPLIED);
    setModalType(PolicyLeaveModalEnums.NONE);
  };

  const onApplyError = (messageKey: string) => {
    handlePolicyLeaveToast({
      type: mapApplyErrorKeyToToastType(messageKey),
      setToastMessage,
      translateText
    });
  };

  const { mutate: applyPolicyLeave, isPending: isApplyPending } =
    useApplyPolicyLeave(selectedYear, onApplySuccess, onApplyError);

  const minDate = useMemo(
    () =>
      selectedPolicyBalance
        ? convertYYYYMMDDToDateTime(selectedPolicyBalance.validFrom).toJSDate()
        : new Date(),
    [selectedPolicyBalance]
  );

  const maxDate = useMemo(
    () =>
      selectedPolicyBalance
        ? convertYYYYMMDDToDateTime(selectedPolicyBalance.validTo).toJSDate()
        : new Date(),
    [selectedPolicyBalance]
  );

  const isStorageFull = useMemo(
    () =>
      environment === appModes.COMMUNITY &&
      storageAvailabilityData !== undefined &&
      TOTAL_PERCENTAGE - storageAvailabilityData.availableSpace >=
        NINETY_PERCENT,
    [environment, storageAvailabilityData]
  );

  const workingDays = useMemo(
    () => timeConfig?.map((config) => config.day) || [],
    [timeConfig]
  );

  const blockingLeaveRequests: MyLeaveRequestPayloadType[] = useMemo(
    () =>
      [
        ...(requestsInStartYear ?? []),
        ...(spansTwoYears ? (requestsInEndYear ?? []) : [])
      ].flatMap((request) => {
        const status = toLeaveStatus(request.status);

        if (!status) {
          return [];
        }

        return [
          {
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
            status,
            isViewed: request.isViewed,
            durationDays: request.durationDays,
            requestDesc: request.requestDesc ?? ""
          }
        ];
      }),
    [requestsInStartYear, requestsInEndYear, spansTwoYears]
  );

  const startAndEndDates = useMemo(
    () => getMonthStartAndEndDates(selectedMonth),
    [selectedMonth]
  );

  useEffect(() => {
    if (!selectedTeam && myTeams && myTeams.length > 0) {
      setSelectedTeam(myTeams[0] ?? null);
    }
  }, [myTeams, selectedTeam]);

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
    const requestId = ++availabilityRequestIdRef.current;

    setHasAvailabilityCheckFailed(false);

    if (
      !selectedPolicyBalance ||
      selectedDates.length === 0 ||
      selectedDuration === LeaveStates.NONE
    ) {
      setAvailability(null);
      return;
    }

    checkAvailability(
      {
        policyId: selectedPolicyBalance.policyId,
        startDate: convertToYYYYMMDDFromDateTime(selectedDates[0]),
        endDate: convertToYYYYMMDDFromDateTime(
          selectedDates[1] ?? selectedDates[0]
        ),
        leaveState: selectedDuration
      },
      {
        onSuccess: (data) => {
          if (requestId === availabilityRequestIdRef.current) {
            setAvailability(data);
          }
        },
        onError: () => {
          if (requestId === availabilityRequestIdRef.current) {
            setAvailability(null);
            setHasAvailabilityCheckFailed(true);
          }
        }
      }
    );
  }, [selectedDates, selectedDuration, selectedPolicyBalance?.policyId]);

  const availabilityError = useMemo(() => {
    if (hasAvailabilityCheckFailed) {
      return translateText(["errors.availabilityCheckFailed"]);
    }

    if (!availability || availability.isValid || !selectedPolicyBalance) {
      return "";
    }
    return getAvailabilityErrorMessage({
      failureReason: availability.failureReason,
      remainingBalance: availability.remainingBalance,
      policyName: selectedPolicyBalance.policyName,
      translateText
    });
  }, [
    hasAvailabilityCheckFailed,
    availability,
    selectedPolicyBalance,
    translateText
  ]);

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
    translateText
  ]);

  useEffect(() => {
    if (hasPolicyLeaveFormErrors(formErrors)) {
      validate();
    }
  }, [selectedDates, comment, attachments]);

  const onSubmit = async () => {
    if (!selectedPolicyBalance || !validate()) {
      return;
    }

    try {
      const attachmentRefs = await uploadPolicyLeaveAttachments({
        attachments,
        environment,
        uploadAttachments
      });

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

  const handleCommentChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setComment(event.target.value);
  };

  const handleAttachmentIconClick = () => {
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

  const handleDeleteAttachment = (attachment: FileUploadType) => {
    setAttachments(attachments.filter((item) => item !== attachment));
  };

  if (!selectedPolicyBalance) {
    return null;
  }

  const isSubmitDisabled =
    selectedDates.length === 0 ||
    selectedDuration === LeaveStates.NONE ||
    isCalendarSelectionInvalid ||
    !!availabilityError;

  const handleCancel = () => {
    setModalType(
      hasUnsavedChanges
        ? PolicyLeaveModalEnums.DISCARD_CHANGES
        : PolicyLeaveModalEnums.NONE
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col md:flex-row gap-3 md:gap-7">
        <div className="flex flex-col gap-3">
          <fieldset
            ref={dateFieldRef}
            tabIndex={-1}
            aria-label={translateAria(["calendar", "selectDateForLeave"])}
            className={
              hasDateError
                ? "min-w-0 rounded-lg border border-semantic-red-accent"
                : "min-w-0"
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
          </fieldset>
          <div className="flex flex-row items-center gap-2">
            <p>
              {translateText(["myPolicyBalance"], {
                policyName: selectedPolicyBalance.policyName
              })}
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
            onChange={setSelectedDuration}
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
            maxLength={MAX_POLICY_LEAVE_COMMENT_LENGTH}
            name="comment"
            value={comment}
            onChange={handleCommentChange}
            iconName={
              selectedPolicyBalance.leaveType.isAttachment
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
          onClick={handleCancel}
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
