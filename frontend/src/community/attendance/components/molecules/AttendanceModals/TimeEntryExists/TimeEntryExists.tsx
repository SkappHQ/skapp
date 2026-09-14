import { Typography } from "@mui/material";
import { ButtonV2 } from "@rootcodelabs/skapp-ui";

import { EmployeeTimesheetModalTypes } from "~community/attendance/enums/timesheetEnums";
import useAddEntry from "~community/attendance/hooks/useAddEntry";
import { useAttendanceStore } from "~community/attendance/store/attendanceStore";
import Icon from "~community/common/components/atoms/Icon/Icon";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";

interface Props {
  fromDateTime: string;
  toDateTime: string;
}

const TimeEntryExists = ({ fromDateTime, toDateTime }: Props) => {
  const translateText = useTranslator("attendanceModule", "timesheet");
  const { setIsEmployeeTimesheetModalOpen, setEmployeeTimesheetModalType } =
    useAttendanceStore((state) => state);

  const { confirmManualTimeEntry } = useAddEntry();

  const handleSubmit = () => {
    confirmManualTimeEntry(fromDateTime, toDateTime);
  };

  return (
    <>
      <Typography variant="body1" sx={{ pt: "1rem" }}>
        {translateText(["entryExistModalDes"])}
      </Typography>
      <div className="flex flex-row justify-end gap-3 mt-4">
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
        <ButtonV2
          variant={"primary"}
          onClick={handleSubmit}
          icon={<Icon name={IconName.CHECK_ICON} />}
          iconPosition="end"
        >
          {translateText(["confirmBtnTxt"])}
        </ButtonV2>
      </div>
    </>
  );
};

export default TimeEntryExists;
