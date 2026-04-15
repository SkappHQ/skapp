import { Typography } from "@mui/material";
import { ButtonV2 } from "@rootcodelabs/skapp-ui";

import { useAddManualTimeEntry } from "~community/attendance/api/AttendanceEmployeeApi";
import { EmployeeTimesheetModalTypes } from "~community/attendance/enums/timesheetEnums";
import { useAttendanceStore } from "~community/attendance/store/attendanceStore";
import {
  convertToUtc,
  getCurrentTimeZone
} from "~community/attendance/utils/TimeUtils";
import Icon from "~community/common/components/atoms/Icon/Icon";
import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { IconName } from "~community/common/types/IconTypes";

interface Props {
  fromDateTime: string;
  toDateTime: string;
}

const TimeEntryExists = ({ fromDateTime, toDateTime }: Props) => {
  const translateText = useTranslator("attendanceModule", "timesheet");
  const { setIsEmployeeTimesheetModalOpen, setEmployeeTimesheetModalType } =
    useAttendanceStore((state) => state);
  const { setToastMessage } = useToast();

  const onSuccess = () => {
    setToastMessage({
      open: true,
      title: translateText(["addTimeEntrySuccessTitle"]),
      description: translateText(["addTimeEntrySuccessDes"]),
      toastType: ToastType.SUCCESS
    });
  };

  const onError = () => {
    setToastMessage({
      open: true,
      title: translateText(["addTimeEntryErrorTitle"]),
      description: translateText(["addTimeEntryErrorDes"]),
      toastType: ToastType.ERROR
    });
  };

  const { mutate: manualEntryMutate } = useAddManualTimeEntry(
    onSuccess,
    onError
  );

  const handleSubmit = () => {
    manualEntryMutate({
      startTime: convertToUtc(fromDateTime) as string,
      endTime: convertToUtc(toDateTime) as string,
      zoneId: getCurrentTimeZone()
    });
    setIsEmployeeTimesheetModalOpen(false);
  };
  return (
    <>
      <Typography variant="body1" sx={{ pt: "1rem" }}>
        {translateText(["entryExistModalDes"])}
      </Typography>
      <div className="flex flex-row justify-end gap-3 mt-6">
        <ButtonV2
          variant={"primary"}
          onClick={handleSubmit}
          icon={<Icon name={IconName.CHECK_ICON} />}
          iconPosition="end"
        >
          {translateText(["confirmBtnTxt"])}
        </ButtonV2>
        <ButtonV2
          variant={"tertiary"}
          onClick={() => {
            setIsEmployeeTimesheetModalOpen(true);
            setEmployeeTimesheetModalType(
              EmployeeTimesheetModalTypes.ADD_TIME_ENTRY
            );
          }}
          icon={<Icon name={IconName.CLOSE_ICON} />}
          iconPosition="end"
        >
          {translateText(["cancelBtnTxt"])}
        </ButtonV2>
      </div>
    </>
  );
};

export default TimeEntryExists;
