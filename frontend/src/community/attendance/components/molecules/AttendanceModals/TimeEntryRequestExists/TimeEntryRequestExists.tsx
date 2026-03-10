import { Typography } from "@mui/material";

import { EmployeeTimesheetModalTypes } from "~community/attendance/enums/timesheetEnums";
import { useAttendanceStore } from "~community/attendance/store/attendanceStore";
import { Button } from "@rootcodelabs/skapp-ui";
import Icon from "~community/common/components/atoms/Icon/Icon";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";

interface Props {
  isEdit: boolean;
}

const TimeEntryRequestExists = ({ isEdit }: Props) => {
  const translateText = useTranslator("attendanceModule", "timesheet");
  const { setIsEmployeeTimesheetModalOpen, setEmployeeTimesheetModalType } =
    useAttendanceStore((state) => state);
  return (
    <>
      <Typography variant="body1" sx={{ pt: "1rem" }}>
        {translateText(["requestExistModalDes"])}
      </Typography>
      <Button variant={"primary"} onClick={() => {
          if (isEdit) {
            setIsEmployeeTimesheetModalOpen(false);
          } else {
            setIsEmployeeTimesheetModalOpen(true);
            setEmployeeTimesheetModalType(
              EmployeeTimesheetModalTypes.ADD_TIME_ENTRY
            );
          }
        }} icon={<Icon name={IconName.CHECK_ICON} />} iconPosition="end">{translateText(["okayBtnTxt"])}</Button>
    </>
  );
};

export default TimeEntryRequestExists;
