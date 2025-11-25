import { Stack, Typography } from "@mui/material";
import { useCallback, useEffect, useMemo } from "react";

import { useUploadImages } from "~community/common/api/FileHandleApi";
import { useStorageAvailability } from "~community/common/api/StorageAvailabilityApi";
import Button from "~community/common/components/atoms/Button/Button";
import TextArea from "~community/common/components/atoms/TextArea/TextArea";
import CalendarDateRangePicker from "~community/common/components/molecules/CalendarDateRangePicker/CalendarDateRangePicker";
import DurationSelector from "~community/common/components/molecules/DurationSelector/DurationSelector";
import { appModes } from "~community/common/constants/configs";
import { FileTypes } from "~community/common/enums/CommonEnums";
import { ButtonStyle } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { LeaveStates } from "~community/common/types/CommonTypes";
import { IconName } from "~community/common/types/IconTypes";
import {
  convertToYYYYMMDDFromDateTime,
  currentYear,
  getFirstDateOfYear,
  getMaxDateOfYear,
  getMonthStartAndEndDates
} from "~community/common/utils/dateTimeUtils";
import { NINETY_PERCENT } from "~community/common/utils/getConstants";
import { useDefaultCapacity } from "~community/configurations/api/timeConfigurationApi";
import {
  useApplyLeave,
  useGetLeaveEntitlementBalance,
  useGetMyRequests,
  useGetResourceAvailability
} from "~community/leave/api/MyRequestApi";
import AttachmentSummary from "~community/leave/components/molecules/AttachmentSummary/AttachmentSummary";
import LeaveEntitlementBalanceCard from "~community/leave/components/molecules/LeaveEntitlementBalanceCard/LeaveEntitlementBalanceCard";
import LeaveSummary from "~community/leave/components/molecules/LeaveSummary/LeaveSummary";
import TeamAvailabilityCard from "~community/leave/components/molecules/TeamAvailabilityCard/TeamAvailabilityCard";
import {
  ApplyLeaveToastEnums,
  LeaveStatusEnums,
  MyRequestModalEnums
} from "~community/leave/enums/MyRequestEnums";
import { useLeaveStore } from "~community/leave/store/store";
import { LeaveRequestItemsType } from "~community/leave/types/LeaveRequestTypes";
import { handleApplyLeaveApiResponse } from "~community/leave/utils/myRequests/apiUtils";
import {
  getApplyLeaveFormValidationErrors,
  getDurationInitialValue,
  getDurationSelectorDisabledOptions
} from "~community/leave/utils/myRequests/applyLeaveModalUtils";
import { useGetAllHolidays } from "~community/people/api/HolidayApi";
import { useGetMyTeams } from "~community/people/api/TeamApi";
import {
  useIsGoogleCalendarConnected,
  useIsMicrosoftCalendarConnected
} from "~enterprise/common/api/CalendarApi";
import { useGetEnvironment } from "~enterprise/common/hooks/useGetEnvironment";
import useGoogleAnalyticsEvent from "~enterprise/common/hooks/useGoogleAnalyticsEvent";
import { GoogleAnalyticsTypes } from "~enterprise/common/types/GoogleAnalyticsTypes";
import { FileCategories } from "~enterprise/common/types/s3Types";
import { uploadFileToS3ByUrl } from "~enterprise/common/utils/awsS3ServiceFunctions";

import styles from "./styles";

const ApplyLeaveModal = () => {
  const classes = styles();

  const { setToastMessage } = useToast();

  const translateStorageText = useTranslator("StorageToastMessage");

  const environment = useGetEnvironment();

  const translateText = useTranslator(
    "leaveModule",
    "myRequests",
    "applyLeaveModal"
  );

  const translateAria = useTranslator("leaveAria", "applyLeave");

  const {
    comment,
    attachments,
    formErrors,
    selectedTeam,
    selectedYear,
    selectedMonth,
    selectedDates,
    selectedDuration,
    selectedLeaveAllocationData,
    isApplyLeaveModalBtnDisabled,
    setComment,
    setSelectedTeam,
    setSelectedDates,
    setSelectedMonth,
    setSelectedDuration,
    setFormErrors,
    setAttachments,
    setMyLeaveRequestModalType,
    setLeaveRequestId
  } = useLeaveStore((state) => ({
    comment: state.comment,
    attachments: state.attachments,
    formErrors: state.formErrors,
    selectedTeam: state.selectedTeam,
    selectedYear: state.selectedYear,
    selectedMonth: state.selectedMonth,
    selectedDates: state.selectedDates,
    selectedDuration: state.selectedDuration,
    selectedLeaveAllocationData: state.selectedLeaveAllocationData,
    isApplyLeaveModalBtnDisabled: state.isApplyLeaveModalBtnDisabled,
    setComment: state.setComment,
    setSelectedTeam: state.setSelectedTeam,
    setSelectedDates: state.setSelectedDates,
    setSelectedMonth: state.setSelectedMonth,
    setSelectedDuration: state.setSelectedDuration,
    setFormErrors: state.setFormErrors,
    setAttachments: state.setAttachments,
    setMyLeaveRequestModalType: state.setMyLeaveRequestModalType,
    setLeaveRequestId: state.setLeaveRequestId,
    setIsMyRequestModalOpen: state.setIsMyRequestModalOpen
  }));

  const firstDateOfYear = useMemo(
    () => getFirstDateOfYear(Number(selectedYear)).toJSDate(),
    [selectedYear]
  );

  const lastDateOfYear = useMemo(
    () => getMaxDateOfYear(Number(selectedYear)).toJSDate(),
    [selectedYear]
  );

  const { data: timeConfig } = useDefaultCapacity();

  const { data: myTeams } = useGetMyTeams();

  const { data: myLeaveRequests } = useGetMyRequests({ isExport: true });

  const { data: allHolidays } = useGetAllHolidays(currentYear.toString(), true);

  const { data: leaveEntitlementBalance } = useGetLeaveEntitlementBalance(
    selectedLeaveAllocationData.leaveType.typeId
  );

  const { data: storageAvailabilityData } = useStorageAvailability();

  const { data: isGoogleConnected } = useIsGoogleCalendarConnected();

  const { data: isMicrosoftConnected } = useIsMicrosoftCalendarConnected();

  const isEnterprise = useGetEnvironment() === appModes.ENTERPRISE;

  const { sendEvent } = useGoogleAnalyticsEvent();

  const onSuccess = (data: LeaveRequestItemsType) => {
    handleApplyLeaveApiResponse({
      type: ApplyLeaveToastEnums.APPLY_LEAVE_SUCCESS,
      setToastMessage,
      translateText
    });
    if (isEnterprise && (isGoogleConnected || isMicrosoftConnected)) {
      setLeaveRequestId(data.leaveRequestId);
      setMyLeaveRequestModalType(MyRequestModalEnums.MARK_OUT_OF_OFFICE);
    } else {
      setMyLeaveRequestModalType(MyRequestModalEnums.NONE);
    }
    sendEvent(GoogleAnalyticsTypes.GA4_LEAVE_REQUEST_APPLIED);
  };

  const onError = (error: string) => {
    let errorType;

    switch (error) {
      case ApplyLeaveToastEnums.LEAVE_ERROR_LEAVE_ENTITLEMENT_NOT_SUFFICIENT:
      case ApplyLeaveToastEnums.LEAVE_ERROR_LEAVE_ENTITLEMENT_NOT_APPLICABLE:
        errorType = error;
        break;
      default:
        errorType = ApplyLeaveToastEnums.APPLY_LEAVE_ERROR;
    }

    handleApplyLeaveApiResponse({
      type: errorType,
      setToastMessage,
      translateText
    });
  };

  const { mutateAsync: uploadAttachments } = useUploadImages();

  const { mutate: applyLeaveMutate, isPending: isLeaveApplyPending } =
    useApplyLeave(selectedYear, onSuccess, onError);

  const usedStoragePercentage = useMemo(() => {
    return 100 - storageAvailabilityData?.availableSpace;
  }, [storageAvailabilityData]);

  const pendingAndApprovedLeaveRequests = useMemo(() => {
    return (
      myLeaveRequests?.filter(
        (request) =>
          request.status === LeaveStatusEnums.PENDING ||
          request.status === LeaveStatusEnums.APPROVED
      ) || []
    );
  }, [myLeaveRequests]);

  const startAndEndDates = useMemo(
    () => getMonthStartAndEndDates(selectedMonth),
    [selectedMonth]
  );

  const workingDays = useMemo(
    () => timeConfig?.map((config) => config.day) || [],
    [timeConfig]
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

  const disabledDurationSelectorOptions = useMemo(() => {
    const disabledOptions = getDurationSelectorDisabledOptions({
      selectedDates,
      duration: selectedLeaveAllocationData.leaveType.leaveDuration,
      myLeaveRequests: pendingAndApprovedLeaveRequests,
      allHolidays
    });

    return disabledOptions;
  }, [
    pendingAndApprovedLeaveRequests,
    allHolidays,
    selectedDates,
    selectedLeaveAllocationData.leaveType.leaveDuration
  ]);

  useEffect(() => {
    const defaultDurationValue = getDurationInitialValue({
      allowedDurations: selectedLeaveAllocationData.leaveType.leaveDuration,
      disabledOptions: disabledDurationSelectorOptions
    });

    setSelectedDuration(defaultDurationValue);
  }, [
    selectedLeaveAllocationData.leaveType.leaveDuration,
    disabledDurationSelectorOptions,
    setSelectedDuration
  ]);

  const checkValidationStatus = useCallback(
    () =>
      getApplyLeaveFormValidationErrors({
        selectedDates,
        comment,
        attachments,
        selectedLeaveAllocationData,
        setFormErrors,
        translateText
      }),
    [
      selectedDates,
      comment,
      attachments,
      selectedLeaveAllocationData,
      setFormErrors,
      translateText
    ]
  );

  useEffect(() => {
    if (
      formErrors?.selectedDates ||
      formErrors?.comment ||
      formErrors?.attachment
    ) {
      checkValidationStatus();
    }
  }, [selectedDates, comment, attachments]);

  const onSubmit = async () => {
    const isValid = checkValidationStatus();
    if (isValid) {
      const fileNames = attachments.map((attachment) => attachment.name ?? "");

      const payload = {
        typeId: selectedLeaveAllocationData.leaveType.typeId,
        startDate: convertToYYYYMMDDFromDateTime(selectedDates[0]),
        endDate: convertToYYYYMMDDFromDateTime(
          selectedDates[1] ?? selectedDates[0]
        ),
        leaveState: selectedDuration,
        requestDesc: comment,
        attachments: fileNames
      };

      if (attachments && attachments.length > 0) {
        if (environment === appModes.COMMUNITY) {
          try {
            const uploadPromises = attachments.map((attachment) => {
              if (attachment.file) {
                const formData = new FormData();
                formData.append("file", attachment.file);
                formData.append("type", FileTypes.LEAVE_ATTACHMENTS);
                return uploadAttachments(formData).then((response) => {
                  const filePath = response.message?.split(
                    "File uploaded successfully: "
                  )[1];
                  return filePath?.split("/").pop() ?? null;
                });
              }
              return Promise.resolve(null);
            });

            const attachmentList = (await Promise.all(uploadPromises)).filter(
              (fileName) => fileName !== null
            ) as string[];

            const updatedPayload = {
              ...payload,
              attachments: attachmentList
            };
            applyLeaveMutate(updatedPayload);
          } catch (error) {
            console.error("Error uploading files: ", error);
          }
        } else {
          try {
            const uploadPromises = attachments.map((attachment) => {
              if (attachment.file) {
                return uploadFileToS3ByUrl(
                  attachment.file as File,
                  FileCategories.LEAVE_REQUEST
                );
              }
              return Promise.resolve(null);
            });

            const attachmentUrls = (await Promise.all(uploadPromises)).filter(
              (url) => url !== null
            ) as string[];

            applyLeaveMutate({
              ...payload,
              attachments: attachmentUrls
            });
          } catch (error) {
            console.error("Error uploading files: ", error);
          }
        }
      } else {
        applyLeaveMutate(payload);
      }
    }
  };

  return (
    <Stack sx={classes.wrapper}>
      <Stack sx={classes.formWrapper}>
        <Stack sx={classes.calendarWrapper}>
          <CalendarDateRangePicker
            selectedDates={selectedDates}
            setSelectedDates={setSelectedDates}
            setSelectedMonth={setSelectedMonth}
            allowedDuration={
              selectedLeaveAllocationData.leaveType.leaveDuration
            }
            allHolidays={allHolidays}
            minDate={firstDateOfYear}
            maxDate={lastDateOfYear}
            workingDays={workingDays}
            myLeaveRequests={pendingAndApprovedLeaveRequests}
            error={formErrors?.selectedDates}
          />
          <Stack sx={classes.textWrapper}>
            <Typography variant="body1">
              {translateText(["myEntitlements"], {
                leaveType: selectedLeaveAllocationData.leaveType.name
              }) ?? ""}
            </Typography>
            <LeaveEntitlementBalanceCard
              leaveEntitlementBalance={leaveEntitlementBalance}
            />
          </Stack>
        </Stack>
        <Stack sx={classes.fieldWrapper}>
          {selectedDates.length && myTeams?.length ? (
            <TeamAvailabilityCard
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
            ariaLabel={{
              icon: translateAria(["comment.icon"])
            }}
            placeholder={translateText(["addComment"])}
            isRequired={
              selectedLeaveAllocationData.leaveType.isCommentMandatory
            }
            isAttachmentRequired={
              selectedLeaveAllocationData.leaveType.isAttachmentMandatory
            }
            maxLength={255}
            name="comment"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            iconName={
              selectedLeaveAllocationData.leaveType.isAttachment
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
                : setMyLeaveRequestModalType(
                    MyRequestModalEnums.ADD_ATTACHMENT
                  );
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
          {!isApplyLeaveModalBtnDisabled && (
            <LeaveSummary
              leaveTypeName={selectedLeaveAllocationData.leaveType.name}
              leaveTypeEmoji={selectedLeaveAllocationData.leaveType.emojiCode}
              leaveDuration={selectedDuration}
              startDate={selectedDates[0]}
              endDate={selectedDates[1]}
              resourceAvailability={resourceAvailability}
              workingDays={workingDays}
            />
          )}
        </Stack>
      </Stack>
      <Stack sx={classes.btnWrapper}>
        <Button
          label={translateText(["submitBtn"])}
          buttonStyle={ButtonStyle.PRIMARY}
          endIcon={IconName.TICK_ICON}
          onClick={onSubmit}
          isLoading={isLeaveApplyPending}
          disabled={isApplyLeaveModalBtnDisabled}
          ariaLabel={translateAria(["confirmApplyLeave"])}
        />
        <Button
          label={translateText(["cancelBtn"])}
          buttonStyle={ButtonStyle.TERTIARY}
          endIcon={IconName.CLOSE_ICON}
          onClick={() => setMyLeaveRequestModalType(MyRequestModalEnums.NONE)}
        />
      </Stack>
    </Stack>
  );
};

export default ApplyLeaveModal;
