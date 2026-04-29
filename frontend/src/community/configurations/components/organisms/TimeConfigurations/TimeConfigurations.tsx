import { Close } from "@mui/icons-material";
import {
  Divider,
  SelectChangeEvent,
  Stack,
  Theme,
  Typography,
  useTheme
} from "@mui/material";
import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { JSX, useCallback, useEffect, useState } from "react";

import BasicChip from "~community/common/components/atoms/Chips/BasicChip/BasicChip";
import Icon from "~community/common/components/atoms/Icon/Icon";
import DropdownList from "~community/common/components/molecules/DropdownList/DropdownList";
import InputField from "~community/common/components/molecules/InputField/InputField";
import ToastMessage from "~community/common/components/molecules/ToastMessage/ToastMessage";
import { daysTypes } from "~community/common/constants/stringConstants";
import {
  DEFAULT_START_TIME,
  daysOfWeek
} from "~community/common/constants/timeConstants";
import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { DropdownListType } from "~community/common/types/CommonTypes";
import { IconName } from "~community/common/types/IconTypes";
import { arraysEqual, getHoursArray } from "~community/common/utils/commonUtil";
import { generateTimeArray } from "~community/common/utils/dateTimeUtils";
import {
  useDefaultCapacity,
  useGetConfigIsRemovable,
  useHandleUpdateDefaultCapacity
} from "~community/configurations/api/timeConfigurationApi";
import { timeConfigurationQueryKeys } from "~community/configurations/api/utils/QueryKeys";
import {
  TimeBlocksTypes,
  TimeConfigurationType,
  WorkingDaysTypes
} from "~community/configurations/types/TimeConfigurationsTypes";
import { toPascalCase } from "~community/people/utils/jobFamilyUtils/commonUtils";

import LeaveRequestRevokeConfirmationModal from "../../molecules/LeaveRequestRevokeConfirmationModal/LeaveRequestRevokeConfirmationModal";
import UnsavedTimeConfigChangesModal from "../../molecules/UnsavedTimeConfigChangesModal/UnsavedTimeConfigChangesModal";
import styles from "./styles";

const TimeConfigurations = (): JSX.Element => {
  const theme: Theme = useTheme();
  const classes = styles();
  const translateText = useTranslator("configurations", "times");

  const router = useRouter();
  const queryClient = useQueryClient();
  const { toastMessage, setToastMessage } = useToast();
  const { data: defaultCapacity } = useDefaultCapacity();
  const timeArray = generateTimeArray();
  const hoursDropdownArray: DropdownListType[] = getHoursArray();

  const [workingDays, setWorkingDays] = useState<WorkingDaysTypes[]>([]);
  const [intialWorkingDays, setInitialWorkingDays] = useState<
    WorkingDaysTypes[]
  >([]);
  const [startTime, setStartTime] = useState<string>("");
  const [weekStartDay, setWeekStartDay] = useState<string>(daysTypes.MONDAY);
  const [totalHours, setTotalHours] = useState<number>(8);
  const [initialValues, setInitialValues] = useState<TimeConfigurationType[]>(
    []
  );
  const [formChanged, setFormChanged] = useState<boolean>(false);
  const [isAllowedToForceChange, setIsAllowedToForceForceChange] =
    useState<boolean>(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] =
    useState<boolean>(false);
  const [newNonWorkingDays, setNewNonWorkingDays] = useState<daysTypes[]>([]);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(
    null
  );

  const { data: configIsRemovable } =
    useGetConfigIsRemovable(newNonWorkingDays);

  const handleSuccess = () => {
    setToastMessage({
      open: true,
      toastType: ToastType.SUCCESS,
      title: translateText(["successToastTitle"]),
      description: translateText(["successToastDescription"])
    });
  };

  const handleError = () => {
    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateText(["errorToastTitle"]),
      description: translateText(["errorToastDescription"])
    });
  };

  const { mutate } = useHandleUpdateDefaultCapacity(handleSuccess, handleError);

  const getHalfDayDuration = useCallback(() => {
    if (Number.isNaN(totalHours)) return "";
    const halfDayDuration = totalHours / 2;
    return `${halfDayDuration} Hour${halfDayDuration === 1 ? "" : "s"}`;
  }, [totalHours]);

  const handleDayChipClick = (day: string, index: number) => {
    const isDayInSettings = workingDays.some((workingDay) =>
      workingDay.day.startsWith(day)
    );

    if (isDayInSettings) {
      if (!newNonWorkingDays.includes(day as daysTypes)) {
        setNewNonWorkingDays([...newNonWorkingDays, day as daysTypes]);
      }

      const updatedSettings = workingDays.filter(
        (workingDay) => !workingDay.day.startsWith(day)
      );
      setWorkingDays(updatedSettings);
    } else {
      const updatedSettings = [...workingDays, { id: index, day }].sort(
        (a, b) => a.id - b.id
      );
      setWorkingDays(updatedSettings);
    }
    setWeekStartDay("");
  };

  const createPayload = () =>
    workingDays.map((workingDay) => ({
      id: workingDay.id,
      day: workingDay.day as daysTypes,
      timeBlocks: [],
      totalHours,
      isWeekStartDay: weekStartDay === workingDay.day,
      time: startTime
    }));

  const handleSave = async () => {
    if (workingDays.length === 0) {
      setToastMessage({
        open: true,
        toastType: ToastType.ERROR,
        title: translateText(["emptyWorkingDaysErrorTitle"]),
        description: translateText(["emptyWorkingDaysErrorDescription"])
      });
      return;
    } else if (!weekStartDay) {
      setToastMessage({
        open: true,
        toastType: ToastType.ERROR,
        title: translateText(["emptyStartOfWeekErrorTitle"]),
        description: translateText(["emptyStartOfWeekErrorDescription"])
      });
      return;
    }

    await queryClient.invalidateQueries({
      queryKey: timeConfigurationQueryKeys.CONFIG_IS_REMOVEVABLE
    });

    const leaveRequestDays = configIsRemovable
      ? configIsRemovable[0].flatMap((item) =>
          Object.entries(item)
            .filter(([_key, value]) => value === false)
            .map(([key]) => key)
        )
      : [];

    const hasLeaveRequests = newNonWorkingDays.some((day) =>
      leaveRequestDays.includes(day)
    );

    if (!isAllowedToForceChange && hasLeaveRequests) {
      setIsConfirmationModalOpen(true);
      return;
    }

    mutate(createPayload());
    setNewNonWorkingDays([]);
  };

  const handleReset = async () => {
    const workingDayArray =
      defaultCapacity?.map((item) => ({
        id: item.id,
        day: item?.day
      })) || [];

    const weekStartDay = defaultCapacity?.find(
      (item) => item.isWeekStartDay === true
    );

    setWeekStartDay(weekStartDay?.day ?? daysTypes.MONDAY);
    setInitialWorkingDays(workingDayArray);
    setWorkingDays(workingDayArray);
    setStartTime(defaultCapacity?.[0]?.startTime || DEFAULT_START_TIME);
    setTotalHours(defaultCapacity?.[0]?.totalHours || 0);
  };

  const handleModalConfirm = () => {
    setIsAllowedToForceForceChange(true);
    mutate(createPayload());
    setNewNonWorkingDays([]);
    setIsConfirmationModalOpen(false);
  };

  const handleModalClose = () => {
    handleReset();
    setIsConfirmationModalOpen(false);
  };

  const handleDiscardChanges = () => {
    setFormChanged(false);
    setShowUnsavedModal(false);
    if (pendingNavigation) {
      router.push(pendingNavigation);
    }
  };

  const handleStayOnPage = () => {
    setShowUnsavedModal(false);
    setPendingNavigation(null);
  };

  const handleRouteChangeStart = useCallback(
    (url: string) => {
      if (formChanged && url !== router.asPath) {
        setPendingNavigation(url);
        setShowUnsavedModal(true);
        router.events.emit("routeChangeError");
        throw "Abort route change";
      }
    },
    [formChanged, router]
  );

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (formChanged) {
        e.preventDefault();
        e.returnValue = "";
        return "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [formChanged]);

  useEffect(() => {
    router.events.on("routeChangeStart", handleRouteChangeStart);
    return () => router.events.off("routeChangeStart", handleRouteChangeStart);
  }, [handleRouteChangeStart, router.events]);

  useEffect(() => {
    if (!defaultCapacity) return;

    const timeConfigurationArray = defaultCapacity.map((item) => ({
      day: item?.day,
      timeBlocks: item?.timeBlocks as TimeBlocksTypes[],
      isWeekStartDay: item?.isWeekStartDay,
      startTime: item?.startTime,
      totalHours: item?.totalHours
    }));

    const workingDayArray = defaultCapacity.map((item) => ({
      id: item.id,
      day: item?.day
    }));

    const startDay = defaultCapacity.find(
      (item) => item.isWeekStartDay === true
    );

    setWeekStartDay(startDay?.day ?? daysTypes.MONDAY);
    setInitialWorkingDays(workingDayArray);
    setWorkingDays(workingDayArray);
    setStartTime(timeConfigurationArray[0]?.startTime || DEFAULT_START_TIME);
    setTotalHours(defaultCapacity[0]?.totalHours || 8);
    setInitialValues(timeConfigurationArray);
  }, [defaultCapacity]);

  useEffect(() => {
    const hasFormChanged = !(
      defaultCapacity?.[0]?.totalHours === totalHours &&
      defaultCapacity?.[0]?.startTime === startTime &&
      arraysEqual(workingDays, intialWorkingDays) &&
      defaultCapacity?.find((item) => item.isWeekStartDay === true)?.day ===
        weekStartDay
    );
    setFormChanged(hasFormChanged);
  }, [
    defaultCapacity,
    initialValues,
    intialWorkingDays,
    startTime,
    totalHours,
    weekStartDay,
    workingDays
  ]);

  return (
    <>
      <Stack sx={classes.container}>
        <Stack sx={classes.sectionContainer}>
          <Typography sx={classes.sectionTitle}>
            {translateText(["globalSettingsTitle"]) ?? ""}
          </Typography>
          <Typography sx={classes.sectionDescription}>
            {translateText(["globalSettingsDescription"]) ?? ""}
          </Typography>
          <Stack sx={classes.dayChipContainer}>
            {daysOfWeek.map((day: string, index: number) => {
              const isSelected = workingDays?.find((workingDay) =>
                workingDay?.day.startsWith(day.toUpperCase())
              );
              return (
                <BasicChip
                  key={day}
                  id={`${day}`}
                  chipStyles={{
                    width: "min-content",
                    color: "common.black",
                    backgroundColor: isSelected
                      ? theme.palette.primary.main
                      : theme.palette.grey[100],
                    padding: "0.75rem 1rem",
                    "&:hover": {
                      backgroundColor: isSelected
                        ? theme.palette.primary.main
                        : theme.palette.grey[100]
                    }
                  }}
                  onClick={() => handleDayChipClick(day.toUpperCase(), index)}
                  label={day.slice(0, 3)}
                />
              );
            })}
          </Stack>
        </Stack>

        <Divider />

        <Stack sx={classes.middleContainer}>
          <Stack sx={classes.dropdownContainer}>
            <Typography sx={classes.sectionTitle}>
              {translateText(["startOfTheWeekTitle"]) ?? ""}
            </Typography>
            <Typography sx={classes.sectionDescription}>
              {translateText(["startOfTheWeekDescription"]) ?? ""}
            </Typography>
            <DropdownList
              ariaLabel={translateText(["startOfTheWeekTitle"]) ?? ""}
              isDisabled={!workingDays?.length}
              id="startDayOfTheWeekDropDownList"
              inputName="startDayOfTheWeek"
              itemList={workingDays.map((item) => ({
                label: toPascalCase(item.day),
                value: item.day
              }))}
              value={weekStartDay}
              onChange={(e: SelectChangeEvent) =>
                setWeekStartDay(e.target.value)
              }
              componentStyle={{ mt: "0rem" }}
            />
          </Stack>

          <Stack sx={classes.dropdownContainer}>
            <Typography sx={classes.sectionTitle}>
              {translateText(["startOfAWorkDayTitle"]) ?? ""}
            </Typography>
            <Typography sx={classes.sectionDescription}>
              {translateText(["startOfAWorkDayDescription"]) ?? ""}
            </Typography>
            <DropdownList
              isDisabled={!workingDays?.length}
              id="startTimeOfWorkingDayDropDownList"
              inputName="startTimeOfWorkingDay"
              itemList={timeArray}
              value={startTime}
              onChange={(e: SelectChangeEvent) => setStartTime(e.target.value)}
              componentStyle={{ mt: "0rem" }}
              ariaLabel={translateText(["startOfAWorkDayTitle"]) ?? ""}
            />
          </Stack>
        </Stack>

        <Divider />

        <Stack sx={classes.sectionContainer}>
          <Typography sx={classes.sectionTitle}>
            {translateText(["numberOfWorkHoursInADayTitle"]) ?? ""}
          </Typography>
          <Typography sx={classes.sectionDescription}>
            {translateText(["numberOfWorkHoursInADayDescription"]) ?? ""}
          </Typography>
          <DropdownList
            isDisabled={!workingDays?.length}
            id="noOfWorkingHoursDropdownList"
            inputName="noOfWorkingHours"
            itemList={hoursDropdownArray}
            value={totalHours}
            onChange={(e: SelectChangeEvent) =>
              setTotalHours(parseInt(e.target.value))
            }
            componentStyle={classes.inputField}
            ariaLabel={translateText(["numberOfWorkHoursInADayTitle"]) ?? ""}
          />

          <Stack sx={classes.inputField}>
            <Stack sx={classes.halfDayInput}>
              <Stack sx={classes.halfDayBox}>
                <Typography sx={classes.halfDayLabel}>
                  {translateText(["morningLabel"]) ?? ""}
                </Typography>
                <InputField
                  ariaLabel={translateText(["morningLabel"]) ?? ""}
                  isDisabled={!workingDays?.length}
                  inputType="text"
                  inputName="noOfMorningWorkingHours"
                  placeHolder="-"
                  value={getHalfDayDuration()}
                  readOnly
                  id="noOfMorningWorkingHoursInputField"
                />
              </Stack>

              <Stack sx={classes.halfDayBox}>
                <Typography sx={classes.halfDayLabel}>
                  {translateText(["eveningLabel"]) ?? ""}
                </Typography>
                <InputField
                  ariaLabel={translateText(["eveningLabel"]) ?? ""}
                  isDisabled={!workingDays?.length}
                  inputType="text"
                  inputName="noOfEveningWorkingHours"
                  placeHolder="-"
                  value={getHalfDayDuration()}
                  readOnly
                  id="noOfEveningWorkingHoursInputField"
                />
              </Stack>
            </Stack>
          </Stack>
        </Stack>

        <Stack sx={classes.buttonContainer}>
          <ButtonV2
            id="resetButton"
            variant={"tertiary"}
            onClick={handleReset}
            disabled={!formChanged}
            icon={<Close />}
            iconPosition="end"
          >
            {translateText(["resetButtonText"]) ?? ""}
          </ButtonV2>
          <ButtonV2
            id="saveChangesButton"
            variant={"primary"}
            onClick={handleSave}
            disabled={!formChanged}
            icon={<Icon name={IconName.RIGHT_ARROW_ICON} />}
            iconPosition="end"
          >
            {translateText(["saveButtonText"]) ?? ""}
          </ButtonV2>
        </Stack>

        <ToastMessage
          {...toastMessage}
          open={toastMessage.open}
          onClose={() => {
            setToastMessage((state) => ({ ...state, open: false }));
          }}
        />
      </Stack>
      <LeaveRequestRevokeConfirmationModal
        isOpen={isConfirmationModalOpen}
        onClose={handleModalClose}
        onConfirm={handleModalConfirm}
        title={translateText(["leaveRequestRevokeModalTitle"])}
        content={translateText(["leaveRequestRevokeModalDescription"])}
      />

      <UnsavedTimeConfigChangesModal
        isOpen={showUnsavedModal}
        onResume={handleStayOnPage}
        onLeave={handleDiscardChanges}
        title={translateText(["unsavedModalTitle"])}
        content={translateText(["unsavedModalDescription"])}
      />
    </>
  );
};

export default TimeConfigurations;
